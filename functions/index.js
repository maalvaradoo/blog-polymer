const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');

admin.initializeApp();

const database = admin.database();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.feedInstantArticles = functions.https.onRequest((rq, rs) => {
 
    request('https://AQUI LA URL DE WORDPRESS/feed/instant-articles', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        
        rs.set('Content-Type','application/rss+xml');
        return rs.send(body);
    });
});

exports.webhook = functions.https.onRequest((rq, rs) => {
  
  if (rq.method === 'POST') {

    let post = rq.body.hook;
    
    if (post.post_type === 'post') {

      if (post.post_status === 'publish') {
        
        database.ref('posts/'+post.post_name).set(post);
        database.ref('categories/' + post.category_slug + '/items/' + post.post_name).set(true);
        database.ref('categories/' + post.category_slug + '/metadata/').set({name: post.category_slug, title: post.category_name});

      }else if (post.post_status === 'trash') {
      
        database.ref('posts/'+post.post_name).remove();
        database.ref('categories/' + post.category_slug + '/items/' + post.post_name).remove();
      
      }

    }

  }else{
    rs.send("Hello, it doesn't work! :P");
  }

  rs.send("Hello");

});