define (['mongoose', 'bcrypt-nodejs'], function(mongoose, bcrypt){
    //Ejemplo ser eliminado de forma impiadosa
    
    // define the schema for our user model
    var userSchema = mongoose.Schema({

        local            : {
            userID : String
        },
        admin : {
            username : String,
            password : String
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
            answers : Array,
            result : {
                up_down : Number,
                positive_negative : Number,
                forward_backward : Number
            }
        },
        symlog: {
            model:String,
            answers : Array,
            up_down : Number,
            positive_negative : Number,
            forward_backward : Number,
            interactions:Number
        },
        evaluation: {
            answers : Array
        },
        recomendations : Array
    });

    var adviceSchema = mongoose.Schema({
        type : String,
        name : String,
        text: String,
        conditions:{
            up_down : {
                comparison : String,
                value : Number
            },
            positive_negative : {
                comparison : String,
                value : Number
            },
            forward_backward : {
                comparison : String,
                value : Number
            }
        },
        explicit : Boolean
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
        },
        analyzed : Boolean,
        configName : String,
        configObj : {
            configName : String,
            isTutorial : Boolean,
            shieldTokens : Number,
            lifeTokens : Number,
            sunTokens : Number,
            ringTokens : Number,
            sauronPosition : Number,
            hobbitPosition : Number,
            locations : Array,
            hobbitCards : Array,
            storyTiles : Array,
            gandalfCards : Array,
            showAdvice : Boolean
        }
    });

    var configSchema = mongoose.Schema({
        currentConfig : String,
        configs : [{
            configName : String,
            isTutorial : Boolean,
            shieldTokens : Number,
            lifeTokens : Number,
            sunTokens : Number,
            ringTokens : Number,
            sauronPosition : Number,
            hobbitPosition : Number,
            locations : Array,
            hobbitCards : Array,
            storyTiles : Array,
            gandalfCards : Array,
            showAdvice : Boolean
        }],
    });

     var chatSchema = mongoose.Schema({
        gameID : String,
        chats : [{
            from : String,
            time: Date,
            text: String
        }]
    });
       
    // checking if password is valid       
    userSchema.methods.validPasswordAdmin = function(password) {         
       return (password == this.admin.password);      
    };

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
    schemas.adviceSchema = mongoose.model('Advice', adviceSchema);
    schemas.gameSchema = mongoose.model('Game', gameSchema);
    schemas.configSchema = mongoose.model('Config', configSchema);
    schemas.chatSchema = mongoose.model('Chat', chatSchema);

    return schemas;
   });
