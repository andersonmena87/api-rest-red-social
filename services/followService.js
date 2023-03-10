const Follow = require('../models/follow');

const folloUserIds = async (identityUserId) => {

    // Sacar info seguimiento

    // Usuarios que sigo
    let following = await Follow.find({ 'user': identityUserId })
        .select({ _id: 0, followed: 1 })
        .exec();

    // Usuarios que me siguen    
    let followers = await Follow.find({ 'followed': identityUserId })
        .select({ _id: 0, user: 1 })
        //.exe() es opcional
        .exec();    


    // Procesar array de identificadores
    const followingClean = following.map(follow => follow.followed);

    const followersClean = followers.map(user => user.user);



    return {
        following: followingClean,
        followers: followersClean
    }
}

const followThisUser = async (identityUserId, profileUserId) => {
    // Sacar info seguimiento

    // Usuarios que sigo
    let following = await Follow.findOne({ 'user': identityUserId, "followed":  profileUserId});

    // Usuarios que me siguen    
    let follower = await Follow.findOne({ 'user': profileUserId, 'followed': identityUserId });
    
    return {
        following,
        follower
    }
}

module.exports = {
    folloUserIds,
    followThisUser
}