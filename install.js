var Service = require('node-windows').Service;

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});




// Create a new service object
var svc = new Service({
  name:'Genesys Webscrapper',
  description: 'web scrapper of Genesys release notes website',
  script: require('path').join(__dirname,'index.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    console.log('Installed succesfully, starting the service');
  svc.start();
});

svc.on('error',function(e){
    console.log('Error: '+e);
});

svc.on('start', function(){
    console.log('Service started succesfully!')
})

svc.on('stop', function(){
    console.log('Service stopped succesfully!')
});

svc.on('alreadyinstalled',function(){
    console.log('Installation failed.');
    console.log('The service exists: ',svc.exists);
  });

  svc.on('alreadyuninstalled',function(){
    console.log('Uninstallation failed.');
    console.log('The service exists: ',svc.exists);
  });

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
    console.log('Uninstall complete.');
    console.log('The service exists: ',svc.exists);
  });
  

 
  rl.setPrompt('Please enter the command to proceed\n'
  +'\t(1)\tinstall\n'
  +'\t(2)\tstart\n'
  +'\t(3)\tstop\n'
  +'\t(4)\tuninstall\n'
  +'\t(5)\tStatus\n'
  +'\tCtrl+C to exit\n'
  +'>');
  
  rl.prompt();

  rl.on('line', (answer) => {
   switch(answer){
       case '1': 
       svc.install();
       break;
       case '2':
       svc.start();
       break;
       case '3':
       svc.stop();
       break;
       case '4':
       svc.uninstall();
       break;
       case '5':
       console.log('Service exists: '+svc.exists);
       break;
       default:
       console.log('Input is not correct');
       
   } 
   rl.prompt();
  }).on('close', () => {
    console.log('^C\n> Have a great day!');
    process.exit(0);
  });