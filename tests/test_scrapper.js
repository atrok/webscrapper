var logger=require('../lib/winstonlogger');
var scrapper=require('../scrapper').scrapperCreate({logger: logger});

scrapper.start();