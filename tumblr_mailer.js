var fs = require('fs');
var ejs = require('ejs');


var tumblr = require('tumblr.js');


var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('stAY36Tm1Pfq8quwKEvozA');

var csvFile = fs.readFileSync("friend_list.csv","utf8");

var csvData = csvParse(csvFile);
// console.log('csvdata:', csvData);


// Authenticate via OAuth
var client = tumblr.createClient({
  consumer_key: 'ra4KGUIZZTtSN1mO5laOH45pMQ4Tu5BlEQT6DsEko95yVpUgpK',
  consumer_secret: 'VPvE3blXHGiSF1WyzF4NQAUqvlQD3a7ssS8ACpF0xVGyy1slyB',
  token: 'mbTVvWlutUAFK8NHoesXa5tSNE2W41CSVfaBh3Y0NvfM1gFbNU',
  token_secret: 'EGwWROrlKil3jPd92ibeHTenFrMqjUvg3mx2GbMKNgPpV4noWG'
});


client.posts('antkim003.tumblr.com', function(err, blog){
  // console.log(blog);
  var blogPosts = oneWeekAgo(blog);

  // ready email and templatize variables
  var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');
  // console.log("email: ",templatizer(emailTemplate, csvData[0]));


  var outputTemplate;
  for (var i = 0; i < csvData.length; i++) {

    outputTemplate = ejs.render(emailTemplate, {csvData: csvData[i], latestPosts: blogPosts });
    sendEmail(csvData[i].firstName + ' ' + csvData[i].lastName, csvData[i].emailAddress, "Anthony", "antkim003@gmail.com",
              "Hello From Fullstack", outputTemplate);
    // console.log(outputTemplate);
  };
  
  
});

function oneWeekAgo(obj) {
  var postDate, oneWeekAgo, output = [];
  
  oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (var i = 0; i < obj.posts.length; i++) {
    postDate = new Date(obj.posts[i].timestamp * 1000);
    if (postDate > oneWeekAgo) {
      // console.log(postDate, oneWeekAgo);
      output.push(obj.posts[i]);
    }
  };
  // console.log(new Date);

  return output;

}


function csvParse(csv) {
  // split by rows
  // set the first row as the key
  // every sequential row is converted into a key-value pair
  var splitByRows = csv.split('\n'),
      keyRow = splitByRows.shift().split(','),
      data = [], newObj;


      for (var i = 0; i < splitByRows.length; i++) {
        splitByRows[i] = splitByRows[i].split(',');

        newObj = {};
        if (splitByRows[i].length > 1) { // check for empty spaces

          for (var j = 0; j < splitByRows[i].length; j++) {
            
              newObj[keyRow[j]] = splitByRows[i][j]
            
            
          };

          data.push(newObj);
        }
      };


  // console.log('data:', data);

  return data;

}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
   var message = {
       "html": message_html,
       "subject": subject,
       "from_email": from_email,
       "from_name": from_name,
       "to": [{
               "email": to_email,
               "name": to_name
           }],
       "important": false,
       "track_opens": true,    
       "auto_html": false,
       "preserve_recipients": true,
       "merge": false,
       "tags": [
           "Fullstack_Tumblrmailer_Workshop"
       ]    
   };
   var async = false;
   var ip_pool = "Main Pool";
   mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
       console.log(message);
       console.log(result);   
   }, function(e) {
       // Mandrill returns the error as an object with name and message keys
       console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
       // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
   });
}

// function templatizer(template, templateValues) {
//   // console.log('inside templatizer',templateValues);
//   for (var key in templateValues) {
//     template = template.replace("{{" + key + "}}", templateValues[key]);

//   }

//   return template;
    
// }

// console.log(emailTemplate);