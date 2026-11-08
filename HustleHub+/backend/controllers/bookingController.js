
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Gig = require("../models/Gig");
const User = require("../models/User");

const createBooking = async (req, res, next) => {
    try {
        const { gigId, requirements } = req.body;

        if (!mongoose.isValidObjectId(gigId)) { //(Mongoose, n.d.)
            return res.status(400).json({
                success: false,
                message: "Invalid gig ID."
            });
        }

        const gig = await Gig.findOne({ //(Mongoose, n.d.)
            _id: gigId,
            isActive: true
        });

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: "Gig not found or no longer available."
            });
        }

        const deliveryDate = new Date();
        deliveryDate.setDate(
            deliveryDate.getDate() + gig.deliveryDays
        );

        const booking = await Booking.create({ //(Mongoose, n.d.)
            gig: gig._id,
            client: req.user.id,
            freelancer: gig.freelancer,
            requirements,
            amount: gig.price,
            status: "Pending",
            deliveryDate
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully.",
            booking
        });

    } catch (error) {
        next(error);
    }
};

// Retrieve bookings belonging to the logged-in client
const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ //(Mongoose, n.d.)
            client: req.user.id
        })
            .populate("gig")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        next(error);
    }
};

// Retrieve a single booking
const getBookingById = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const booking = await Booking.findById(req.params.id)
            .populate("gig");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        // Only the client or assigned freelancer may view it.
        if (
            booking.client !== req.user.id &&
            booking.freelancer !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot access this booking."
            });
        }

        res.status(200).json({
            success: true,
            booking
        });

    } catch (error) { //(Express.js, n.d.)
        next(error);
    }
};

const getFreelancerBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            freelancer: req.user.id
        })
            .populate("gig")
            .sort({ createdAt: -1 });

        const clientIds = [...new Set(bookings.map((booking) => booking.client))];
        const clients = await User.find({ _id: { $in: clientIds } })
            .select("_id firstName lastName username email")
            .lean();
        const clientsById = new Map(clients.map((client) => [client._id, client]));
        const bookingsWithClients = bookings.map((booking) => {
            const client = clientsById.get(booking.client);
            const clientName = client
                ? [client.firstName || client.username, client.lastName].filter(Boolean).join(" ")
                : "Client";

            return { ...booking.toObject(), clientName };
        });

        res.status(200).json({
            success: true,
            count: bookingsWithClients.length,
            bookings: bookingsWithClients
        });
    } catch (error) {
        next(error);
    }
};

const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const validStatuses = [
            "Pending",
            "Confirmed",
            "In Progress",
            "Completed",
            "Cancelled"
        ];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "A valid booking status is required."
            });
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        if (
            booking.client !== req.user.id &&
            booking.freelancer !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this booking."
            });
        }

       // Preserve the original completion date if the booking is already completed.
       // Otherwise, record the date when it first becomes completed.
        if (status === "Completed" && booking.status !== "Completed") {
            booking.completedAt = new Date();
        }

       // Clear the date if a completed booking is reopened or cancelled.
        if (status !== "Completed") {
            booking.completedAt = null;
        }

        booking.status = status;

        await booking.save();

        res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    getFreelancerBookings,
    updateBookingStatus
};

/*Reference List

Mongoose, (n.d.). Mongoose v8.17.0 API: Mongoose.prototype.isValidObjectId(). [online] Available at: https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.isValidObjectId() [Accessed: 7 October 2026]

Mongoose, (n.d.). Mongoose v8.17.0 API: Model. [online] Available at: https://mongoosejs.com/docs/api/model.html [Accessed: 7 October 2026]..

Express.js, (n.d.). Writing error handlers. [online] Available at: https://expressjs.com/en/guide/error-handling/ [Accessed: 7 October 2026].
*/