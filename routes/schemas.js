
define (['mongoose'], function(mongoose){
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
        survey: {
            complete:Boolean,
            result : {
                up_down : Number,
                positive_negative : Number,
                forward_backward : Number
            }
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
            isTutorial : Boolean,
            sauronPosition : Number,
            hobbitPosition : Number,
            locations : Array,
            hobbitCards : Array,
            storyTiles : Array,
            gandalfCards : Array
        }]
    });

     var chatSchema = mongoose.Schema({
        gameID : String,
        chats : [{
            from : String,
            time: Date,
            text: String
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


    var schemas = {};
    // create the model for users and expose it to our app
    schemas.userSchema = mongoose.model('User', userSchema);
    schemas.gameSchema = mongoose.model('Game', gameSchema);
    schemas.configSchema = mongoose.model('Config', configSchema);
    schemas.chatSchema = mongoose.model('Chat', chatSchema);

    return schemas;
   });