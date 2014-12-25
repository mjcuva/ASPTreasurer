var mongoose = require('mongoose');

var BudgetSchema = new mongoose.Schema({
    amount:   {type: Number, required: true},
    position: {type: String, required: true},
    semester: {type: String, required: true}
});

mongoose.model("Budget", BudgetSchema);