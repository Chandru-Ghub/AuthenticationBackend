var nodemailer = require('nodemailer');
console.log('connecting....');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{

        user: 'chandrumech455@gmail.com',
        pass: 'xuxovtfkvomairak'
    }

});

const names  = ['chandru','santhosh','sarath','kundri','naveen']

result = Math.floor(Math.random()*names.length)

const msg = names[result]
console.log(msg);

var mailOptions = {

    from: 'chandrumech455@gmail.com',
    to: 'chandruinfo455@gmail.com',
    subject: 'sending email',
    text: 'hellow '+ msg
};



transporter.sendMail(mailOptions, (err,info)=>{

    if(err){
        console.log(err);
    }else{
        console.log('message '+ info.response);
    }
});

