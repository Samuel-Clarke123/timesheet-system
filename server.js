// server.js

/* Code written by Samuel J. Clarke, May-June 2018, for CumulusVFX. */

// ####### VALUES THAT MAY NEED EDITING EN EL FUTURO ## //
var tasks = {"default": ["Clean-Up", "Roto", "Precomp", "3d", "Comp", "Misc", "Track", "FX", "Paint", "Ingest", "Animation"],
			 "admin":   ["Annual Leave", "Sick Leave", "Idle", "Training", "Meetings", "Housekeeping", "Engineering", "Repairs"]};
var projs = ["Back of the Net", "Occupation 2", "At Last", "2040", "Lamb Of God", "ram", "Chocolate Oyster", "2Wolves", "Predator", "Admin"];
var daysdict={"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6};
var RowEnum = {"id": 0, "user": 1, "start": 2, "end": 3, "proj": 4, "vacation": 5, "note": 6};
var days=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
Object.freeze(RowEnum);

// ## init variables, imports etc ## //

var express        = require('express');
var fs             = require('fs');
var util           = require('util');
var session        = require('express-session');
var app            = express();
var passwordHash   = require('password-hash');
var bodyParser     = require('body-parser');
var partials       = require('express-partials');
var XLSX           = require('xlsx');
var multer         = require('multer')
var upload         = multer({ inMemory: true })

var passport       = require('passport'),
    LocalStrategy  = require('passport-local').Strategy/*,
	GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;*/
var mongodb        = require('mongodb').MongoClient;
var url            = 'mongodb://guest:'+process.env.MONGO_PASS+'@ds016298.mlab.com:16298/timetable';  // Connection URL.


// ## configuring express ## //

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(express.static(__dirname + '/public'));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());


// ## page rendering in relation to the database ## //

// Use connect method to connect to the Server
mongodb.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} else {
		console.log('Connected to the mongoDB server. ' + url.split(process.env.MONGO_PASS).join("{SECRET_PASSWORD}"));

		var ttdb = db.db("timetable");

		var usersDB = ttdb.collection('users'); // this stores all of the users, and their weekly timesheet.
		var timesheetDB = ttdb.collection('timesheets'); // this stores all 'archived' timesheets. only admins can edit these timesheets. organised by date { date: *date, user: *name, jobs: *jobs[] }
		var plansDB = ttdb.collection('plans'); // this stores all of the auto-fill data. things like project defaults. its basically just a group of future 'jobs'. timesheets that "will" exist. organised by date { date: *date, user: *name, jobs: *jobs[] }
		var parsedDB = ttdb.collection('parsed'); // this stores all of the parsed spreadsheet. atm just to work with some ajax on the planner page (remembering what their last spreadsheet was).

		// http://expressjs.com/en/starter/basic-routing.html
		app.get("/", ensureAuthenticated, function (req, res) {
			var thisdate = "Current";

			if(req.user.isadmin) {//swjp
				usersDB.find().toArray(function(err, users) { 
					if(err) throw err;

					var tuser = req.user;
					if(req.query.tuser) {
						tuser = req.query.tuser;
					}

					usersDB.findOne({"name": (tuser.name ? tuser.name : tuser)}, function(err, dbuser) {
						if(err) throw err;

						timesheetDB.find({"user": dbuser.name}).toArray(function(err, timesheets) {
							if(err) throw err;

							timesheets.unshift({"user": dbuser.name, "jobs": dbuser.timesheet.jobs, "date": thisdate});
							for(var i = 1; i <= 4; i++) {
								timesheets.unshift({"user": dbuser.name, "jobs": [], "date": getThisDate(getNextWeek(new Date(), 10, i))});
							}

							var targetdate = (req.query.tdate ? req.query.tdate : thisdate);
							
							var ttsheet = req.user.timesheet;
							for(var tsheet of timesheets) {
								if(tsheet.date == targetdate) ttsheet = tsheet;
							}

							if(targetdate != "Current" && new Date(targetdate).getTime() > getPreviousMonday().getTime()) {// the target date is in the future, plans get the scans
								plansDB.findOne({"date": targetdate, "$text": {"$search": dbuser.name, "$language": "english", "$caseSensitive": false}}, function(err, data) {
									if(err) throw err;
									if(!data) {
										console.log("unable to find plan for user " + req.user.name + " on date " + targetdate);
										ttsheet = {"date": targetdate, "user": dbuser.name, "jobs": []};
									}
									else {
										ttsheet = data;
									}
									return res.render("index.ejs", {tday: (req.query.tday ? req.query.tday : false), editable: true, targetdate: targetdate, timesheets: timesheets,
										 							users: users, tuser: dbuser, user: req.user, error: req.query.err, timesheet: ttsheet, projs: projs, tasks: tasks});
								});
							} else {
								return res.render("index.ejs", {tday: (req.query.tday ? req.query.tday : false), editable: true, targetdate: targetdate, timesheets: timesheets,
									 							users: users, tuser: dbuser, user: req.user, error: req.query.err, timesheet: ttsheet, projs: projs, tasks: tasks});
							}
						});
					})
				});
			} else {
				timesheetDB.find({"user": req.user.name}).toArray(function(err, timesheets) {
					if(err) throw err;

					timesheets.unshift({"user": req.user.name, "jobs": req.user.timesheet.jobs, "date": thisdate});
					for(var i = 1; i <= 4; i++) {
						timesheets.unshift({"user": req.user.name, "jobs": [], "date": getThisDate(getNextWeek(new Date(), 10, i))});
					}

					var targetdate = (req.query.tdate ? req.query.tdate : thisdate);
					
					var ttsheet = req.user.timesheet;
					for(var tsheet of timesheets) {
						if(tsheet.date == targetdate) ttsheet = tsheet;
					}
					
					// editable logic
					editable = true;
					var prevWeekUNIX = getNextWeek(new Date(), 10, -1).getTime();
					var targWeekUNIX = new Date(targetdate).getTime();
					if(targWeekUNIX < prevWeekUNIX) editable = false;

					if(targetdate != "Current" && new Date(targetdate).getTime() > getPreviousMonday().getTime()) {// the target date is in the future, plans get the scans
						plansDB.findOne({"date": targetdate, "$text": {"$search": req.user.name, "$language": "english", "$caseSensitive": false}}, function(err, data) {
							if(err) throw err;

							if(!data) {
								ttsheet = {"user": req.user.name, "jobs": [], "date": targetdate};
							}
							else {
								ttsheet = data;
							}
							return res.render("index.ejs", {tday: (req.query.tday ? req.query.tday : false), editable: editable, targetdate: targetdate, timesheets: timesheets, user: req.user, error: req.query.err, timesheet: ttsheet, projs: projs, tasks: tasks});
						});
					} else {
						return res.render("index.ejs", {tday: (req.query.tday ? req.query.tday : false), editable: editable, targetdate: targetdate, timesheets: timesheets, user: req.user, error: req.query.err, timesheet: ttsheet, projs: projs, tasks: tasks});
					}
				});
			}
		});

		app.get("/planner", ensureAuthenticated, function(req, res) {
			if(req.user.isadmin != "true") {
				return res.redirect("/?err=You%20don't%20have%20permissions%20to%20use%20the%20planner");
			}
			return res.render("planner.ejs", {error: false, user: req.user});
		});
		app.post("/ajax/planviaspreadsheet", upload.single('file'), ensureAJAXAuthenticated, function(req, res) { // this ended up being such a large algorithm :/
			// req.file is the spreadsheet file, loaded in memory. ty multer <3
			if(req.user.isadmin != "true") {
				return res.redirect("/?err=You%20don't%20have%20permissions%20to%20use%20the%20planner");
			}

			var spreadsheet = XLSX.read(req.file.buffer);
			var sheet = spreadsheet.Sheets[spreadsheet.SheetNames[0]];

			var rows = [];
			var now = new Date();

			for (var row_name in sheet) {
				// check if the property/key is defined in the object itself, not in parent
				if (sheet.hasOwnProperty(row_name)) {
					if(row_name[0] != "!") {
						var row = CSVToArray(sheet[row_name].v);
						rows.push(row[0].splice(0, 7)); // explaining the splice: the last two variables are the date it was updated, and who it was updated by. 
						                                //the first we dont care about, the second we also dont care about, and its always going to be 'CumulusVFX' anyway.
					}
				}
			}
			rows.shift(); // the first element is always that weird key thing. dont need it, got my enums.

			// convert to single days, whilst also removing ones that are earlier than todays date.

			var sdjs = []; // "single day jobs" -- takes the parsed data, and, for each row, for each day in the start date to the end date, adds a job.
			for(var row of rows) {
				try {
					var dates = getDates(new Date(row[RowEnum.start]), new Date(row[RowEnum.end]));
				} catch(ex) {
					return res.end("1");
				}
				for(var date of dates) {
					var pmon = new Date(getPreviousMonday(new Date(date.getTime()), 10)).getTime();
					if(pmon >= getNextMonday(10).getTime()) { // if its not coming in this week
						if(date.getDay() != 6 && date.getDay() != 0) { // if its not saturday or sunday.
							sdjs.push({"user": row[RowEnum.user], "monday": getThisDate(new Date(pmon)), "unix-date": date.getTime(), "proj": (row[RowEnum.proj] ? row[RowEnum.proj] : "-"), 
										"hours": 8, "shot": (row[RowEnum.note] ? row[RowEnum.note] : "-"), "task": (row[RowEnum.vacation] == "x" ? "Absent" : "Misc")});
						}
					} else {
						//console.log(getNextMonday(10).getTime(), " ", pmon);
					}
				}
			} sdjs.sort( (a, b) => { //sort by date, then by user.
				if(a["unix-date"] < b["unix-date"]) return -1;
				else if(a["unix-date"] > b["unix-date"]) return +1;
				else if(a["user"] < b["user"]) return -1;
				else if(a["user"] > b["user"]) return +1;
				else return 0;
			});

			if(sdjs.length <= 0) return res.end("1");

			// for intersecting days, get the other intersecting days with the same user, and divide its hours by the amount found. (this is the largest the data will ever get, promise)
			for(var i in sdjs) {
				var same_day_jobs = 0;
				var targetdate = sdjs[i]["unix-date"];
				var targetuser = sdjs[i].user;
				for(var j = i; j < sdjs.length && sdjs[j]["unix-date"] == targetdate; j++) { // since it's already sorted, we can just walk through it.
					if(sdjs[j].user == targetuser) same_day_jobs += 1;
				}

				if(sdjs[i].hours == 8) { // should always be true, just a fail-safe to not divide twice
					sdjs[i].hours /= same_day_jobs;
				} else { // also, yes, i know its way more inefficient to do it one at a time, but this whole thing shouldnt be being called often at all, and it runs smooth enough anyway. ill leave that as a stretch goal.
					console.log("Something went wrong, somethings starting with, like, ", sdjs[i].hours, " hours, this should only ever be 8   >:(");
				}
			} 
			sdjs.sort( (a, b) => { // sort by monday, then by user.
				if(a["monday"] < b["monday"]) return -1;
				else if(a["monday"] > b["monday"]) return +1;
				else if(a["user"] < b["user"]) return -1;
				else if(a["user"] > b["user"]) return +1;
				else return 0;
			});
			//console.log("Planned sdjs snapshot (just the first 7):: \n", JSON.stringify(sdjs.slice(0, 7), null, 2));//debug

			// group them by week (the data gets to shrink here, phew.) (basically just turning them into my standard timesheet format (MSTF))
			var timesheets = []; // timesheets, generated from the plans.
			for(var i = 0; sdjs.length > 0; ) {
				var twjs = []; // this weeks jobs = an array holding all of the jobs for the week, for the user.
				var targetmonday = sdjs[i].monday;
				var targetuser = sdjs[i].user;

				var toRemove = 0;
				for(var j = i; j < sdjs.length && sdjs[j].monday == targetmonday && sdjs[j].user == targetuser; j++) {
					twjs.push({
						"task": sdjs[j].task,
						"day": days[(new Date(sdjs[j]["unix-date"]).getDay() == 0 ? 6 : new Date(sdjs[j]["unix-date"]).getDay() - 1)],
						"time": sdjs[j].hours,
						"proj": sdjs[j].proj,
						"id": makeSlug(15, 15)
					});
					toRemove += 1;
				} 
				console.log(targetmonday, "  |  ", getThisDate(new Date(targetmonday)));
				var thisweek = {
					"user": targetuser,
					"date": getThisDate(new Date(targetmonday)),
					"unix-date": new Date(targetmonday).getTime(),
					"jobs": twjs
				}
				timesheets.push(thisweek);

				sdjs.splice(i, toRemove);
			}
			delete sdjs; // sdjs aren't needed anymore, (even though it should be empty at this point), and are cleared.

			console.log("Planned timesheets snapshot (just the first 7):: \n", JSON.stringify(timesheets.slice(0, 7), null, 2));

			// clear the db, and add the new timesheets
			plansDB.remove({}).then(function() { // clear the db
				parsedDB.remove({}).then(function() { // clear the rows db
					plansDB.insert(timesheets, function(err, data) {
						if(err) throw err;
						parsedDB.insert({rows}, function(err, data) {
							if(err) throw err;
							return res.end("0");
						});
					});
				});
			});
		});
		app.get("/ajax/getplans", ensureAJAXAuthenticated, function(req, res) {
			if(req.user.isadmin != "true") {
				res.end('{"error": "Insufficient permissions"}');
			} else {
				parsedDB.find().toArray(function(err, data) {
					if(err) throw err;
					res.end(JSON.stringify(data, null, 2));
				});;
			}
		});
		/*app.get("/test", function(req, res) {
			res.render("test.ejs", {user: false, error: false});
		});
		app.get("/ajaxtest", function(req, res) {
			res.send(req.query.search + req.query.search);
		});*/
		app.post("/code/addjob", ensureAJAXAuthenticated, function(req, res) {
			if(req.body.date != "Current" && new Date(req.body.date).getTime() > getPreviousMonday().getTime()) {// the target date is in the future, plans !i!i DONT !i!i get the scans
				return res.end(JSON.stringify({"err": "Future weeks are read only.", "errcode": 403, "data": {}}, null, 2));
			}

			usersDB.findOne({"name": req.body.jobuser}, function(err, user) {
				console.log("adding "+user.name+"'s job on date " + req.body.date + " day " + req.body.day, "NOW:", getThisDate());
				timesheetDB.findOne({"user": user.name, "date": req.body.date}, function(err, timesheet) {
					if(err) throw err;

					var truets = true;
					if(!timesheet) {
						timesheet = user.timesheet;
						truets = false;
					}

					var toIns = {
						"day": req.body.day,
						"shot": req.body.shotcode,
						"proj": req.body.project,
						"time": req.body.timespent,
						"task": req.body.task,
						"id": makeSlug(15, 15)
					};
					if(toIns.day.length && toIns.shot && toIns.proj && toIns.time && toIns.task) {
						if(toIns.day.length  > 11) return res.end(JSON.stringify({"err": "Day Length too Long!", "errcode": 400, "data": ""}, null, 2));
						if(toIns.shot.length > 35) return res.end(JSON.stringify({"err": "Shot code too long!", "errcode": 400, "data": ""}, null, 2));
						if(toIns.proj.length > 25) return res.end(JSON.stringify({"err": "Project code too long", "errcode": 400, "data": ""}, null, 2));
						if(toIns.task.length > 20) return res.end(JSON.stringify({"err": "Task too long", "errcode": 400, "data": ""}, null, 2));
						if(toIns.day.length  <  2) return res.end(JSON.stringify({"err": "Day too short", "errcode": 400, "data": ""}, null, 2));
						if(toIns.task.length <  1) return res.end(JSON.stringify({"err": "Task too short", "errcode": 400, "data": ""}, null, 2));
		
						timesheet.jobs.push(toIns);
		
						if(!truets) {
							req.user.timesheet = timesheet;
							usersDB.update({name: user.name}, {"name": user.name,"displayName": user.displayName,"dob": user.dob,"password": user.password,"isadmin": user.isadmin,"email": user.email,"timesheet": user.timesheet}, function(err, data) {
								if(err) throw err;
								return res.end(JSON.stringify({"err": "", "errcode": 200, "data": toIns}, null, 2)); //painfulpart
							});
						} else {
							timesheetDB.update({"user": user.name, "date": req.body.date}, {"user": timesheet.user, "jobs": timesheet.jobs, "date": timesheet.date}, function(err, data) {
								if(err) throw err;
								return res.end(JSON.stringify({"err": "", "errcode": 200, "data": toIns}, null, 2)); //painfulpart
							});
						}
					} else {
						return res.end(JSON.stringify({"err": "Missing input fields!", "errcode": 400, "data": {}}, null, 2));
					}
				});
			});
		});

		app.post("/code/deljob", ensureAJAXAuthenticated, function(req, res) {
			usersDB.findOne({"name": req.body.jobuser}, function(err, user) {
				timesheetDB.findOne({"user": user.name, "date": req.body.date}, function(err, timesheet) {
					if(err) throw err;
					console.log("deleting " + req.body.jobuser + "'s job on date " + req.body.date);

					var truets = true;
					if(!timesheet) {
						timesheet = user.timesheet;
						truets = false;
					}
					
					for(var i = 0; i < timesheet.jobs.length && i != -1; i++) {
						if(timesheet.jobs[i].id == req.body.jobid) {
							if(!truets) user.timesheet.jobs.splice(i, 1);
							else timesheet.jobs.splice(i, 1);
							
							if(!truets) {
								req.user.timesheet = timesheet;
								usersDB.update({name: user.name}, {"name": user.name,"displayName": user.displayName,"dob": user.dob,"password": user.password,"isadmin": user.isadmin,"email": user.email,"timesheet": timesheet}, function(err, data) {
									if(err) throw err;
									return res.end(JSON.stringify({"err": "", "errcode": 200,}, null, 2)); //painfulpart
								});
								break;
							} else {
								timesheetDB.update({"user": user.name, "date": req.body.date}, {"user": timesheet.user, "jobs": timesheet.jobs, "date": timesheet.date}, function(err, data) {
									if(err) throw err;
									return res.end(JSON.stringify({"err": "", "errcode": 200,}, null, 2)); //painfulpart
								});
								break;
							}
						} else if(i >= timesheet.jobs.length - 1) { // if its the last job, and its still not found anything, redirect them.
							return res.end(JSON.stringify({"err": "Job Not Found", "errcode": 400}, null, 2));
						}
					}
				});
			});
		});

		app.get("/help", function (req, res) {
			res.render("help.ejs", {user: req.user, error: req.query.err});
		});


		// ## AUTH SECTION ## //
		
		app.get("/login", function (req, res) {
			res.render("login.ejs", {user: req.user, error: req.query.err});
		});

		app.get("/signup", ensureAuthenticated, function(req, res) {
			if(req.user.isadmin == "true") {
				res.render("signup.ejs", {user: req.user, error: req.query.err});
			}
		});

		app.get("/changepassword", ensureAuthenticated, function(req, res) {
			res.render("changepassword.ejs", {user: req.user, error: req.query.err});
		});

		// ## PASSPORT ## //
		// Passport session setup.
		//   To support persistent login sessions, Passport needs to be able to
		//   serialize users into and deserialize users out of the session.  Typically,
		//   this will be as simple as storing the user ID when serializing, and finding
		//   the user by ID when deserializing... but im lazy and this will work fine, 
		//   since the user load on this server is not expected to be high, and older timesheets
		//   will be stored elsewhere.
		passport.serializeUser(function(user, done) {
			done(null, user);
		});
	
		passport.deserializeUser(function(obj, done) {
			done(null, obj);
		});

		// ## LOCAL PASSPORT STRATEGY ## //

		passport.use(new LocalStrategy(function(username, password, done) {
			usersDB.findOne({ name: displayNameToUsername(username) }, function(err, user) {
				if (err) { return done(err); }
				if (!user) {
					return done(null, false, { message: 'Incorrect username.' });
				}
				if (!passwordHash.verify(password, user.password)) {
					return done(null, false, { message: 'Incorrect password.' });
				}
				return done(null, user);
			});
		}));

		// TODO: hook this up to the google api // in the end, maybe not? we'll see.
		/*
		
		// ## GOOGLE PASSPORT STRATEGY ## //

		passport.use(new GoogleStrategy({
			clientID:     process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "http://myurl:8000/auth/googlefunction getPreviousMonday(prevMonday=new Date(), hours=10) {
	prevMonday = new Date(prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7));
	prevMonday.setHours(hours); prevMonday.setMinutes(0); prevMonday.setSeconds(0); prevMonday.setMilliseconds(0);
	return prevMonday;
}
			passReqToCallback: true
		  },
		  function(request, accessToken, refreshToken, function getPreviousMonday(prevMonday=new Date(), hours=10) {
	prevMonday = new Date(prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7));
	prevMonday.setHours(hours); prevMonday.setMinutes(0); prevMonday.setSeconds(0); prevMonday.setMilliseconds(0);
	return prevMonday;
}
			User.findOrCreate({ googleId: profile.id },function getPreviousMonday(prevMonday=new Date(), hours=10) {
	prevMonday = new Date(prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7));
	prevMonday.setHours(hours); prevMonday.setMinutes(0); prevMonday.setSeconds(0); prevMonday.setMilliseconds(0);
	return prevMonday;
}
			  return done(err, user);
			});
		  }
		));

		app.get('/auth/google',
			passport.authenticate('google', { scope: [ function getPreviousMonday(prevMonday=new Date(), hours=10) {
	prevMonday = new Date(prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7));
	prevMonday.setHours(hours); prevMonday.setMinutes(0); prevMonday.setSeconds(0); prevMonday.setMilliseconds(0);
	return prevMonday;
}
				'https://www.googleapis.com/auth/plus.login',
				'https://www.googleapis.com/auth/plus.profile.emails.read' 
		]}));

		app.get( '/auth/google/callback',
			passport.authenticate( 'google', {
				successRedirect: '/auth/google/success',
				failureRedirect: '/auth/google/failure'
		}));*/

		app.post("/auth/signup", ensureAuthenticated, function(req, res) {
			if(req.user.isadmin) {
				if(req.body.username.length > 25 || req.body.password > 25 || req.body.confirmpassword > 25) res.redirect("/signup?err=Input%20Fields%20Too%20Long.");
				else if(req.body.password != req.body.confirmpassword || req.body.password.length < 4 || req.body.username.length < 2) {
					if(req.body.username.length < 2) res.redirect("/signup?err=Username%20cant%20be%20that%20short.");
					else if(req.body.password.length < 4 || req.body.confirmpassword.length < 4) res.redirect("/signup?err=Password%20can't%20be%20that%20short.");
					else res.redirect("/signup?err=Passwords%20don't%20match.");
				} else {
					var date = new Date();
					var now = date.getTime();
					var toIns = {
						"name": displayNameToUsername(req.body.username),
						"displayName": req.body.username,
						"dob": now,
						"password": hashOf(req.body.password),
						"isadmin": req.body.isadmin,
						"email": req.body.email,
						"timesheet": {"jobs": []}
					};
					usersDB.findOne({"name": toIns.name}, function(err, data) {
						if(err) throw err;

						if(!data) {
							usersDB.insert(toIns);
							console.log("everbody welcome " + toIns.name + "!");
							res.redirect("/?err=User%20successfully%20added.");
						} else {
							res.redirect("/signup?err=User%20already%20exists.");
						}
					});
				}
			} else {
				res.redirect("/?err=Only%20Admins%20Can%20Make%20New%20Users.")
			}
		});

		app.post("/auth/login", passport.authenticate('local', { failureRedirect: '/login?err=Login%20details%20incorrect.' }), function(req, res) {
			return res.redirect("/");
		});

		app.get("/auth/logout", function(req, res) {
			req.logout();
			return res.redirect('/login');
		});

		app.post("/auth/changepassword", ensureAuthenticated, function(req, res) {
			if(req.body.newpassword != req.body.newconfirmpassword) {
				return res.redirect("/changepassword?err=Password%20must%20be%20the%20same%20as%20the%20confirmation%20password.")
			} else if (req.body.newpassword.length < 4) {
				return res.redirect("/changepassword?err=Your%20New%20Password%20Cant%20Be%20That%20Short.");
			} else if (req.body.newpassword.length > 25) {
				return res.redirect("/changepassword?err=Your%20New%20Password%20Cant%20Be%20That%20Long.");
			}

			if(passwordHash.verify(req.body.oldpassword, req.user.password)) {
				req.user.password = hashOf(req.body.newpassword); 
				var user = req.user;
				usersDB.update({name: user.name}, {"name": user.name,"displayName": user.displayName,"dob": user.dob,"password": user.password,"isadmin": user.isadmin,"email": user.email,"timesheet": user.timesheet}, function(err, data) { //painfulpart
					if(err) throw err;
					return res.redirect("/");
				});
			} else {
				return res.redirect("/?err=Your%20password%20is%20incorrect.");
			}
		});


		//The 404 Route (ALWAYS Keep this as the last route)
		app.get('*', function(req, res){
			res.render('404.ejs', {user: req.user, error: req.query.err});
		});

		
		// ## AUTO SUBMIT FUNCTION ## //

		function callMeOnMonday(effective) {
			var now = new Date();
			//if(!effective) {now.setDate(10); now.setMonth(7);} // debug, makes it run once, just to force the user timesheets into the outdated bin.
			nextMonday = getNextMonday(10);
			setTimeout(callMeOnMonday, nextMonday.getTime() - now.getTime(), true);

			if(effective) {
				//now.setDate(28); now.setMonth(4); // debug, sets the date to upload.
				console.log("It's a monday! Moving the timesheets! " + getThisDate(now));
				var thisdate = getThisDate(now); // this is broken, just inserting the current date i think, idk, please fix this future me
				
				usersDB.find().toArray(function(err, users) {
					for(var tuser of users) {
						var toIns = {"user": tuser.name, "jobs": tuser.timesheet.jobs, "date": thisdate};
						console.log("timesheet insert called on " + tuser.name, thisdate);
						timesheetDB.insert(toIns, function(err, data) {
							if(err) throw err;
							console.log(data.ops[0].user + " has had his timesheets inserted into the timesheet db.");
						});
					}

					function updateUsers(ind) {
						tuser = users[ind];

						console.log("attempting to find plans for " + tuser.name);
						plansDB.findOne({"date": thisdate, "$text": {"$search": tuser.name, "$language": "english", "$caseSensitive": false}}, function(err, data) {
							if(err) throw err;

							console.log(thisdate);
							console.log(tuser.name);

							var ts = "";
							if(!data) ts = {"jobs": []}
							else ts = data;
							console.log(data);
							var toInsu = {"name": tuser.name, "displayName": tuser.displayName, "dob": tuser.dob, "password": tuser.password, "isadmin": tuser.isadmin, "email": tuser.email, "timesheet": ts};
							console.log("update called on " + tuser.name);
		
							usersDB.update({name: tuser.name}, toInsu, function(err, data) { // target behaviour: calls update, which calls this function again, with 1 higher index.
								if(err) throw err;
								console.log(tuser.name + " updated.");
								if(++ind < users.length) updateUsers(ind); // if its not looping outside of the max users, update the next user.
							});
							console.log("exiting updateUsers");
						});						
					} 
					updateUsers(0);
				});
			}
		}
		callMeOnMonday(false);
	}
});


// ## server initialization ## //

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


var http = require('http');
var https = require('https');

var sslOptions = {
	'passphrase': process.env.HTTPS_PASS,
	'key': fs.readFileSync(__dirname + '/certs/key.pem'),
	'cert': fs.readFileSync(__dirname + '/certs/cert.pem')
};  

http.createServer(app).listen(process.env.HTTP_PORT, function() {console.log("Http is online on port " + process.env.HTTP_PORT);});
https.createServer(sslOptions, app).listen(process.env.HTTPS_PORT, function() {console.log("Https is online on port " + process.env.HTTPS_PORT);});


// listen for requests :)
/*var listener = app.listen(process.env.PORT, function () {
	console.log('Your app is listening on port ' + listener.address().port);
});*/


// ## helper functions ## //

function makeSlug(min, max) {
	var t = "";
	for(var i = 0; i < min + Math.floor(Math.random() * (max - min)); i++) {
		var base = 65 + (Math.random() * 25);
		if(Math.random() < 0.4) {
		base += 32;
		} else if (Math.random() < 0.3) {
		base = 48 + Math.random() * 9;
		} t += String.fromCharCode(base);
	} 
	return t;
}

function getThisDate(now=new Date()) {
	return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
}

/* gets the next monday, at the specified hours */
function getNextMonday(hours) { 
	var d = new Date();
	d = new Date(d.setDate(d.getDate() + (7-d.getDay())%7+1));
	d.setHours(hours); d.setMinutes(0); d.setSeconds(0); d.setMilliseconds(0);
	return d;
}
function getNextWeek(now=new Date(), hours=10, mult=1) {
	var nextWeek = new Date(now.getTime() + (mult * 7 * 24 * 60 * 60 * 1000));
	return getPreviousMonday(nextWeek, hours);
}
function getPreviousMonday(prevMonday=new Date(), hours=10) {
	prevMonday = new Date(prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7));
	prevMonday.setHours(hours); prevMonday.setMinutes(0); prevMonday.setSeconds(0); prevMonday.setMilliseconds(0);
	return prevMonday;
}

function displayNameToUsername(username) {
	return username.split(' ').join('-').toLowerCase();
}

function hashOf(input) {
	return passwordHash.generate(input);
}

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login?err=Unable%20to%20authenticate%20user.')
}
function ensureAJAXAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.end(JSON.stringify({"err": "User Is Not Authenticated", "errcode": 403, "data": ""}))
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}


// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");
	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp( (
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		), "gi");
	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];
	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;
	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){
		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			strMatchedDelimiter !== strDelimiter
			){
			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );
		}
		var strMatchedValue;
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){
			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);
		} else {
			// We found a non-quoted value.
			strMatchedValue = arrMatches[ 3 ];
		}
		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}



// function is1917(now=new Date()) { if(now.getMonth() == 2 && now.getDate() == 8) { return now.getYear() - 17; } else { return -1; } }


 // end server.js