import passport from "passport";
import routes from "../routes";
import User from '../models/users.js'

export const getJoin = (req, res) => res.render(
    "join", {pageTitle: "Join"}
    );
export const postJoin = async (req, res, next) => {
    const {
        body:{name, email, password, password2}
    }= req;
    if(password!==password2){
        res.status(400);
        res.render("join", {pageTitle: "Join"});
    }else{
        try{
            const user =  await User({
                name,
                email
            });
            await User.register(user, password);
            next();
        }catch(error){
            console.log(error);
            res.redirect(routes.home);
        }
    }
};



export const getLogin = (req, res) => {
    res.render("login", {pageTitle: "LogIn"})
};
export const postLogin = passport.authenticate("local", {
    failureRedirect: routes.login,
    successRedirect: routes.home
});



export const githubLogin = passport.authenticate("github");

export const githubLoginCallback = async(accessToken, refreshToken, profile, done) => {
    const {_json: {id, avatar_url:avatarUrl, name, email}} = profile;
    try{
        const user = await User.findOne({email});
        if(user){
            user.githubId = id;
            user.save();
            return done(null, user);
        }
        const newUser = await User.create({
            email,
            name,
            githubId: id,
            avatarUrl
        });
        return done(null, newUser);
        
    }catch(error){
        return done(error);
    }
};

export const postGithubLogin = (req, res) => {
    res.redirect(routes.home);
}




export const facebookLogin = passport.authenticate("facebook");

export const facebookLoginCallback = async(accessToken, refreshToken, profile, done) => {
    const {_json: {id, name, email}} = profile;
    try{
        const user = await User.findOne({email});
        if(user){
            user.facebookId = id;
            user.avatarUrl= `https://graph.facebook.com${id}/picture?type=large`;
            user.save();
            return done(null, user);
        }
        const newUser = await User.create({
            email,
            name,
            facebookId: id,
            avatarUrl: `https://graph.facebook.com${id}/picture?type=large`
        });
        return done(null, newUser);
        
    }catch(error){
        return done(error);
    }
};

export const postfacebookLogin = (req, res) => {
    res.redirect(routes.home)
}


export const logout = (req, res) => {
    req.logout((error) => {
        if(error){
            res.status(500).send("Error has occured");
        }
        res.redirect(routes.home);
    });
};


export const getEditProfile = (req, res) => res.render("editProfile", {pageTitle: "Edit Profile"});

export const postEditProfile = async(req, res) => {
    const {
        body:{name, email},
        file
    } = req;
    try{
        await User.findByIdAndUpdate(req.user.id, {
            name,
            email,
            avatarUrl: file? file.path: req.user.avatarUrl
        });
        res.redirect(routes.me);
    }catch(error){
        res.redirect("editProfile", {pageTitle: "Edit Profile"});
    }
};


export const getchangePassword = (req, res) => res.render("changePassword", {pageTitle: "Change Password"});

export const postchangePassword = async(req, res) => {
    const {
        body: {oldpassword, newpassword, newpassword1}
    }=req;
    try{
        if(newpassword !== newpassword1){
            res.status(400);
            res.redirect(routes.changePassword);
            return;
        }
        await req.user.changePassword(oldpassword, newpassword);
        res.redirect(routes.me);
    }catch(error){
        res.status(400);
        res.redirect(routes.changePassword);
    }
};


export const getMe = (req, res) => {
    res.render("userDetail", {pageTitle:"User Detail", user: req.user});
}

export const userDetail = async(req, res) => {
    const {params : {id}} = req;
    try{
        const user = await User.findById(id).populate("videos");
        res.render("userDetail", {pageTitle: "User Detail", user});
    }
    catch(error){
        res.redirect(routes.home);
    }
}
    
