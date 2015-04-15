
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/test');

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
            userID : String,
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

    var configSchema = mongoose.Schema({
        currentConfig : String,
        configs : [{
            configName : String,
            sauronPosition : Number,
            hobbitPosition : Number,
            locations : Array,
            hobbitCards : Array,
            storyTiles : Array,
            gandalfCards : Array
        }]
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
    module.exports.configSchema = mongoose.model('Config', configSchema);

    /*
    var newConfig =  new module.exports.configSchema();
    newConfig.currentConfig = "default";
    newConfig.configs.push({
        configName : "default",
        sauronPosition : 15,
        hobbitPosition : 0,
        locations : ["BagEnd","Rivendell","Moria","Lothlorien","Helm","Shelob","Mordor"],
        hobbitCards : [{
            card : {symbol : "Fighting", color : "White", image:"fight_card_white", amount:1},
            amount : 7
        },
        {
            card : {symbol : "Friendship", color : "White", image:"friend_card_white", amount:1},
            amount : 7
        },
        {
            card : {symbol : "Hiding", color : "White", image:"hiding_card_white", amount:1},
            amount : 7
        },
        {
            card : {symbol : "Travelling", color : "White", image:"travel_card_white", amount:1},
            amount : 7
        },
        {
            card : {symbol : "Fighting", color : "Gray", image:"fight_card_gray", amount:1},
            amount : 5
        },
        {
            card : {symbol : "Friendship", color : "Gray", image:"friend_card_gray", amount:1},
            amount : 5
        },
        {
            card : {symbol : "Hiding", color : "Gray", image:"hiding_card_gray", amount:1},
            amount : 5
        },
        {
            card : {symbol : "Travelling", color : "Gray", image:"travel_card_gray", amount:1},
            amount : 5
        },
        {
            card : {symbol : "Joker", color : "None", image:"joker_card", amount:1},
            amount : 12
        }],
        storyTiles :  ["Friendship","Friendship","Friendship","Travelling","Travelling","Travelling","Hiding","Hiding","Hiding","Fighting","Fighting","Fighting","Next Event","Next Event","Next Event","Next Event","Next Event","Next Event","Ring Influence","Ring Influence","Sauron Will"]
    });

    newConfig.save(function(err) {
                            if (err){
                                throw err;
                            }
                    });

    */