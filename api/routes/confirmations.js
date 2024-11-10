const confirmationRouter = require('express').Router();
const Confirmations = require('../database/schemes/confirmations');
const Users = require('../database/schemes/users');

confirmationRouter.get('/verify/:username/:token', async (req, res) => {
    try {
        const user = await Users.findOne({ username: req.params.username });
        if (!user) return res.status(400).send("Invalid user");

        const token = await Confirmations.findOne({
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid token");

        await Users.updateOne({ _id: user._id, verified: true });
        await Confirmations.findByIdAndDelete(token._id);

        res.status(200).send("email verified successfully");
    }
    catch (error) {
        res.status(400).send("An error occured");
        console.log(error)
    }
})

module.exports = {
    confirmationRouter
}