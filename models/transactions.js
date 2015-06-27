var mongoose = require('mongoose');

var TransactionSchema = new mongoose.Schema({
    cost:        {type: Number, required: true},
    date:        {type: Date, required: true},
    description: {type: String, required: true},
    position:    {type: String, required: true},
    semester:    {type: String, required: true}
});

mongoose.model('Transaction', TransactionSchema);