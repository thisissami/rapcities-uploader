var mongodb = require('mongodb'),
  mongoserver = new mongodb.Server('localhost', 26374),
  dbConnector = new mongodb.Db('uenergy', mongoserver),
  http = require('http');

var base = '/api/v4/artist/profile?api_key=AOGW6OBBGGYABOKGX&bucket=id:facebook';/*&bucket=biographies'+
           '&bucket=blogs&bucket=familiarity&bucket=hotttnesss&bucket=images&bucket=news&bucket=reviews'+
           '&bucket=songs&bucket=urls&bucket=video&bucket=years_active';*/
var request = {}
  request['host'] = 'developer.echonest.com';
  request['port'] = 80;
      
var done = false; 

dbConnector.open(function(err, db){
  if(err){
    console.log('oh shit! connector.open error!');
    console.log(err.message);
  }
  else{
    console.log('opened successfully');
    db.createCollection('artists', function(err, artists){
      if(err){
        console.log('oh shit! db.createCollection error!');
        console.log(err.message);
      }
      else{
        console.log('artists created');
        cursor = artists.find({'artist':{'$exists':false}});
        cursor.count(function(err,tot){
          if(err){console.log('fuck you for not working count!');}
          else{ 
            total = tot;
            console.log('total'+total);
            intervalID = setInterval(doNext, 650, artists);
          }
        });
      }
    });
  }
});

var totCount = 0;
var count = 0;
function doNext(artists){
  cursor.nextObject(function(err, artist){
    if(err){
      console.log('Cursor.each error');
      console.log(err.message);
    }
    else if(artist != null){
      count++;
      //console.log('count '+ count);      
      request['path'] = base + '&id='+artist._id;
      console.log('id: '+artist._id);
      http.get(request, function(response){
        var body = '';
        response.on('data', function(data){
          body += data;
        });
        response.on('end', function(){
          var results = JSON.parse(body);
          if(results.response.status.code == 0){
            artist['artist'] = results.response.artist;        
            artists.findAndModify({'_id':artist['_id']},[['_id','asc']],artist,{},function(err){
              if(err){
                console.log('find and modify error');
                console.log(err.message);
              }
              count--;
              totCount++;
              console.log(totCount)
              console.log(done)
              if(count <= 0 && done == true){
                console.log('\nFIN!\n\ntotal elements changed: '+totCount);
                if(done)
                  process.exit();
              }
            });
          }
          else{console.log(results.response)}
        });
      }).on('error',function(e){
          console.log('request error');
          console.log(e.message);
      });
    }
    else{ done = true; clearInterval(intervalID); if(count <= 0){ console.log(totCount); process.exit(); }}
  });
}
