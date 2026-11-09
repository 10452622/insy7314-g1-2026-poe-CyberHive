
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        gig: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gig",
            required: true
        }, //(IIe, 2026)

        client: {
            type: String,
            required: true
        },

        freelancer: {
            type: String,
            required: true
        },

        requirements: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "In Progress",
                "Completed",
                "Cancelled"
            ],
            default: "Pending"
        },

       // Records the actual date on which the booking was completed.
       // Used to allocate completed booking revenue to the correct tax year.
        completedAt: {
            type: Date,
            default: null
        },

        deliveryDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Booking", bookingSchema); //(IIE, 2026)

/*Reference List

The Independent Institute of Education (IIE), 2026. Information Systems 3D [INSY7314 Module Manual]. The Independent Institute of 
  Education: Unpublished.
*/
