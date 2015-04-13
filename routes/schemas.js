
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://matanegui:patrite0@ds061611.mongolab.com:61611/lotr-test');

    //Ejemplo ser eliminado de forma impiadosa

    // define the schema for our user model
    var userSchema = mongoose.Schema({

        local            : {
            userID : String
        },
        facebook         : {
            id           : String,
            token        : String,
            name         : String
        },
        twitter          : {
            id           : String,
            token        : String,
            displayName  : String,
            username     : String
        },
        google           : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        recomendations : Array
    });

    var gameSchema = mongoose.Schema({
    	gameID : String,
    	created : Date,
    	complete : Boolean,
    	players : [{
    		playerID : String,
    		alias : String,
    		character : String
    	}],
    	gameActions : Array,
        result : {
            victory : Boolean,
            reason : String,
            score : Number
        }
    });

    // generating a hash
    userSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.local.password);
    };

    // create the model for users and expose it to our app
    module.exports.userSchema = mongoose.model('User', userSchema);
    module.exports.gameSchema = mongoose.model('Game', gameSchema);
