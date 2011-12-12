var email = require('nodemailer'),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length;

email.SMTP = {
  host: 'localhost',
  port: '587',
  use_authentication: true,
  user: 'thisissami',
  pass: '4rt1stn4m3'
}
    
if(cluster.isMaster){
  console.log(numCPUs + ' cores on this machine.');
  for(var i = 0; i < numCPUs; i++)
    cluster.fork();
    
  cluster.on('death', function(worker){
    console.log('worker ' + worker.pid + ' died.');
    emailSamiWorker('Worker Died!','Worker ' + worker.pid + ' has passed away...');
    cluster.fork();
  });
  process.on("SIGTERM", process.exit);
  process.on("SIGINT", process.exit);
  process.on("SIGKILL", process.exit);
  /*process.on("SIGTERM", websiteDown);
  process.on('exit',websiteDown);
  process.on('SIGINT', websiteDown);*/
}
else{
  connect = require('connect'),
  url = require('url'),
  path = require('path'),
  fs = require('fs'),
  songetter = require('./songInterface');
        
  function onRequest(req, res, next) {
    var parsed = url.parse(req.url,true);
    var pathname = parsed.pathname;
    var ext = path.extname(pathname);
    
    switch(pathname){
      case '/getSongs': console.log('getting songs!'); songetter.getSongs(res, parsed.query); break;
      default: return;
    }
  }
    
  connect.createServer(
    require('./fileServer')(),
    //remove this once connect reaches v2.0.0 - connect.compress({memLevel:9}),
    connect.logger(),
    onRequest).listen(8888);
  console.log('Server has started.');
}

function emailSamiWorker(sub, bod){
  return function (){
    email.send_mail({
      sender : 'Undanceable Energy <fuuuuuck@undanceableenergy.com>',            // domain used by client to identify itself to server
      to : 'thisissamster@gmail.com',
      subject : sub,
      body: bod
      },
      function(err, success){
        if(err){ console.log('emailing sami about worker death!'+err); }
        else console.log('just emailed sami!');
    });
  }
}

/*function websiteDown(){
  email.send_mail({
    sender : 'Undanceable Energy <fuuuuuck@undanceableenergy.com>',            // domain used by client to identify itself to server
    to : 'thisissamster@gmail.com',
    subject : "WEBSITE'S DOWN!",
    body: "The process seems to have exited",
    },
    function(err, success){
      if(err){ console.log('emailing sami issue!'+err); }
      else console.log('just emailed sami!\n\nalso... THE SITE WENT DOWN OH NOOOOO');
      
     process.exit();
  });
}*/
