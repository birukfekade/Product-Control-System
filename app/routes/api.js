var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(router) {
    var client = nodemailer.createTransport({
        service: 'Zoho',
        auth: {
            user: 'brbrana@gmail.com.com',
            pass: 'this is our password'
        },
        tls: { rejectUnauthorized: false }
    });
    router.post('/users', function(req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.name = req.body.name;
        user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });

        if (req.body.username === null || req.body.username === '' || req.body.password === null || req.body.password === '' || req.body.email === null || req.body.email === '' || req.body.name === null || req.body.name === '') {
            res.json({ success: false, message: 'Ensure username, email, and password were provided' });
        } else {
            user.save(function(err) {
                if (err) {
                    if (err.errors !== null) {
                        if (err.errors.name) {
                            res.json({ success: false, message: err.errors.name.message });
                        } else if (err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message });
                        } else if (err.errors.username) {
                            res.json({ success: false, message: err.errors.username.message });
                        } else if (err.errors.password) {
                            res.json({ success: false, message: err.errors.password.message });
                        } else {
                            res.json({ success: false, message: err });
                        }
                    } else if (err) {
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That username is already taken' });
                            } else if (err.errmsg[61] == "e") {
                                res.json({ success: false, message: 'That e-mail is already taken' });
                            }
                        } else {
                            res.json({ success: false, message: err });
                        }
                    }
                } else {
                    var email = {
                        from: 'from bkfekade@gmail.com',
                        to: [user.email, 'bkfekade@gmail.com'],
                        subject: 'Your Activation Link',
                        text: 'Hello ' + user.name + ', thank you for registering at localhost.com. Please click on the following link to complete your activation: http://localhost:8080/activate/' + user.temporarytoken,
                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thank you for registering at localhost.com. Please click on the link below to complete your activation:<br><br><a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/activate/</a>'
                    };
                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(info);
                            console.log(user.email);
                        }
                    });
                    res.json({ success: true, message: 'Account registered! Please check your e-mail for activation link.' });
                }
            });
        }
    });

    router.post('/checkusername', function(req, res) {
        User.findOne({ username: req.body.username }).select('username').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That username is already taken' });
                } else {
                    res.json({ success: true, message: 'Valid username' });
                }
            }
        });
    });
    router.post('/checkemail', function(req, res) {
        User.findOne({ email: req.body.email }).select('email').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That e-mail is already taken' });
                } else {
                    res.json({ success: true, message: 'Valid e-mail' });
                }
            }
        });
    });
    router.post('/authenticate', function(req, res) {
        var loginUser = (req.body.username).toLowerCase();
        User.findOne({ username: loginUser }).select('email username password active').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Username not found' });
                } else if (user) {
                    if (!req.body.password) {
                        res.json({ success: false, message: 'No password provided' });
                    } else {
                        var validPassword = user.comparePassword(req.body.password);
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' });
                        } else if (!user.active) {
                            res.json({ success: false, message: 'Account is not yet activated. Please check your e-mail for activation link.', expired: true });
                        } else {
                            var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                            res.json({ success: true, message: 'User authenticated!', token: token });
                        }
                    }
                }
            }
        });
    });

    router.put('/activate/:token', function(req, res) {
        User.findOne({ temporarytoken: req.params.token }, function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                var token = req.params.token;
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Activation link has expired.' });
                    } else if (!user) {
                        res.json({ success: false, message: 'Activation link has expired.' });
                    } else {
                        user.temporarytoken = false;
                        user.active = true;
                        user.save(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                var email = {
                                    from: 'bkfekade@gmail.com',
                                    to: user.email,
                                    subject: 'Account Activated',
                                    text: 'Hello ' + user.name + ', Your account has been successfully activated!',
                                    html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your account has been successfully activated!'
                                };
                                client.sendMail(email, function(err, info) {
                                    if (err) console.log(err);
                                });
                                res.json({ success: true, message: 'Account activated!' });
                            }
                        });
                    }
                });
            }
        });
    });
    router.post('/resend', function(req, res) {
        User.findOne({ username: req.body.username }).select('username password active').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Could not authenticate user' }); // Username does not match username found in database
                } else if (user) {
                    if (req.body.password) {
                        var validPassword = user.comparePassword(req.body.password);
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' });
                        } else if (user.active) {
                            res.json({ success: false, message: 'Account is already activated.' });
                        } else {
                            res.json({ success: true, user: user });
                        }
                    } else {
                        res.json({ success: false, message: 'No password provided' });
                    }
                }
            }
        });
    });

    router.put('/resend', function(req, res) {
        User.findOne({ username: req.body.username }).select('username name email temporarytoken').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        var email = {
                            from: 'bkfekade@gmail.com',
                            to: user.email,
                            subject: 'Activation Link Request',
                            text: 'Hello ' + user.name + ', You recently requested a new account activation link. Please click on the following link to complete your activation: https://immense-dusk-71112.herokuapp.com/activate/' + user.temporarytoken,
                            html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently requested a new account activation link. Please click on the link below to complete your activation:<br><br><a href="http://www.herokutestapp3z24.com/activate/' + user.temporarytoken + '">http://www.herokutestapp3z24.com/activate/</a>'
                        };
                        client.sendMail(email, function(err, info) {
                            if (err) console.log(err);
                        });
                        res.json({ success: true, message: 'Activation link has been sent to ' + user.email + '!' }); // Return success message to controller
                    }
                });
            }
        });
    });
    router.get('/resetusername/:email', function(req, res) {
        User.findOne({ email: req.params.email }).select('email name username').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'E-mail was not found' });
                } else {
                    var email = {
                        from: 'Localhost Staff, http://localhost:8080',
                        to: user.email,
                        subject: 'Localhost Username Request',
                        text: 'Hello ' + user.name + ', You recently requested your username. Please save it in your files: ' + user.username,
                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently requested your username. Please save it in your files: ' + user.username
                    };
                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(info);
                        }
                    });
                    res.json({ success: true, message: 'Username has been sent to e-mail! ' });
                }
            }
        });
    });

    router.put('/resetpassword', function(req, res) {
        User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Username was not found' });
                } else if (!user.active) {
                    res.json({ success: false, message: 'Account has not yet been activated' });
                } else {
                    user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            var email = {
                                from: 'bkfekade@gmail.com',
                                to: user.email,
                                subject: 'Reset Password Request',
                                text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://www.herokutestapp3z24.com/reset/' + user.resettoken,
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://www.herokutestapp3z24.com/reset/' + user.resettoken + '">http://www.herokutestapp3z24.com/reset/</a>'
                            };
                            client.sendMail(email, function(err, info) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(info);
                                    console.log('sent to: ' + user.email);
                                }
                            });
                            res.json({ success: true, message: 'Please check your e-mail for password reset link' }); // Return success message
                        }
                    });
                }
            }
        });
    });

    router.get('/resetpassword/:token', function(req, res) {
        User.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                var token = req.params.token;
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Password link has expired' });
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'Password link has expired' });
                        } else {
                            res.json({ success: true, user: user });
                        }
                    }
                });
            }
        });
    });

    router.put('/savepassword', function(req, res) {
        User.findOne({ username: req.body.username }).select('username email name password resettoken').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (req.body.password === null || req.body.password === '') {
                    res.json({ success: false, message: 'Password not provided' });
                } else {
                    user.password = req.body.password;
                    user.resettoken = false;
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            var email = {
                                from: 'bkfekade@gmail.com',
                                to: user.email,
                                subject: 'Password Recently Reset',
                                text: 'Hello ' + user.name + ', This e-mail is to notify you that your password was recently reset at localhost.com',
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at localhost.com'
                            };
                            client.sendMail(email, function(err, info) {
                                if (err) console.log(err);
                            });
                            res.json({ success: true, message: 'Password has been reset!' });
                        }
                    });
                }
            }
        });
    });

    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' });
        }
    });
   
    router.post('/me', function(req, res) {
        res.send(req.decoded);
    });

    router.get('/renewToken/:username', function(req, res) {
        User.findOne({ username: req.params.username }).select('username email').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'No user was found' });
                } else {
                    var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                    res.json({ success: true, token: newToken });
                }
            }
        });
    });

    router.get('/permission', function(req, res) {
        User.findOne({ username: req.decoded.username }, function(err, user) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'No user was found' });
                } else {
                    res.json({ success: true, permission: user.permission });
                }
            }
        });
    });

    router.get('/management', function(req, res) {
        User.find({}, function(err, users) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                User.findOne({ username: req.decoded.username }, function(err, mainUser) {
                    if (err) {
                        var email = {
                            from: 'bkfekade@gmail.com',
                            to: ' bkfekade@gmail.com',
                            subject: 'Error Logged',
                            text: 'Error Sent to bkfekade@gmail.com: ' + err,
                            html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                        };
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(info);
                                console.log(user.email);
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' });
                        } else {
                            if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                                if (!users) {
                                    res.json({ success: false, message: 'Users not found' });
                                } else {
                                    res.json({ success: true, users: users, permission: mainUser.permission });
                                }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' });
                            }
                        }
                    }
                });
            }
        });
    });

    router.delete('/management/:username', function(req, res) {
        var deletedUser = req.params.username;
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' });
                } else {
                    if (mainUser.permission !== 'admin') {
                        res.json({ success: false, message: 'Insufficient Permissions' });
                    } else {
                        User.findOneAndRemove({ username: deletedUser }, function(err, user) {
                            if (err) {
                                var email = {
                                    from: 'bkfekade@gmail.com',
                                    to: ' bkfekade@gmail.com',
                                    subject: 'Error Logged',
                                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                                };
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(info);
                                        console.log(user.email);
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true });
                            }
                        });
                    }
                }
            }
        });
    });

    router.get('/edit/:id', function(req, res) {
        var editUser = req.params.id;
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); 
                } else {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({ _id: editUser }, function(err, user) {
                            if (err) {
                                var email = {
                                    from: 'bkfekade@gmail.com',
                                    to: ' bkfekade@gmail.com',
                                    subject: 'Error Logged',
                                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                                };
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(info);
                                        console.log(user.email);
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: 'No user found' });
                                } else {
                                    res.json({ success: true, user: user });
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permission' });
                    }
                }
            }
        });
    });

    router.put('/edit', function(req, res) {
        var editUser = req.body._id;
        if (req.body.name) var newName = req.body.name;
        if (req.body.username) var newUsername = req.body.username;
        if (req.body.email) var newEmail = req.body.email;
        if (req.body.permission) var newPermission = req.body.permission;
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                var email = {
                    from: 'bkfekade@gmail.com',
                    to: ' bkfekade@gmail.com',
                    subject: 'Error Logged',
                    text: 'Error Sent to bkfekade@gmail.com: ' + err,
                    html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!mainUser) {
                    res.json({ success: false, message: "no user found" });
                } else {
                    if (newName) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    var email = {
                                        from: 'bkfekade@gmail.com',
                                        to: ' bkfekade@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'Error Sent to bkfekade@gmail.com: ' + err,
                                        html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                                    };
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(info);
                                            console.log(user.email);
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' });
                                    } else {
                                        user.name = newName;
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({ success: true, message: 'Name has been updated!' });
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' });
                        }
                    }
                    if (newUsername) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    var email = {
                                        from: 'bkfekade@gmail.com',
                                        to: ' bkfekade@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'Error Sent to bkfekade@gmail.com: ' + err,
                                        html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                                    };
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); 
                                        } else {
                                            console.log(info);
                                            console.log(user.email);
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' });
                                    } else {
                                        user.username = newUsername;
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({ success: true, message: 'Username has been updated' });
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' });
                        }
                    }
                    if (newEmail) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    var email = {
                                        from: 'bkfekade@gmail.com',
                                        to: ' bkfekade@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'Error Sent to bkfekade@gmail.com: ' + err,
                                        html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                                    };
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(info);
                                            console.log(user.email);
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' });
                                    } else {
                                        user.email = newEmail;
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({ success: true, message: 'E-mail has been updated' });
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' });
                        }
                    }

                    if (newPermission) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    var email = {
                                        from: 'bkfekade@gmail.com',
                                        to: ' bkfekade@gmail.com',
                                        subject: 'Error Logged',
                                        text: 'Error Sent to bkfekade@gmail.com: ' + err,
                                        html: 'Error Sent to bkfekade@gmail.com:<br><br>' + err
                                    };
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(info); 
                                            console.log(user.email); 
                                        }
                                    });
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' });
                                    } else {
                                        if (newPermission === 'user') {
                                            if (user.permission === 'admin') {
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' });
                                                } else {
                                                    user.permission = newPermission;
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); 
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission;
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); 
                                                    }
                                                });
                                            }
                                        }
                                        if (newPermission === 'moderator') {
                                            if (user.permission === 'admin') {
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin' });
                                                } else {
                                                    user.permission = newPermission; 
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' });
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission;
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' });
                                                    }
                                                });
                                            }
                                        }
                                        if (newPermission === 'admin') {
                                            if (mainUser.permission === 'admin') {
                                                user.permission = newPermission;
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); 
                                                    }
                                                });
                                            } else {
                                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' });
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' });
                        }
                    }
                }
            }
        });
    });

    return router;
};
