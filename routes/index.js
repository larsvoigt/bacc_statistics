const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

let Reports;

const ignore = ['MathML Sample (HTML)', 'MathML Sample (CSS)', 'Test', 'MathML Sample (Image)', ''];


function setUpConnectionToStatisticDB() {

    const mongoDB = 'mongodb://192.168.1.198/bacc';

    mongoose.connect(mongoDB, {useNewUrlParser: true});
    mongoose.Promise = global.Promise;
    const reportSchema = new mongoose.Schema({
        checkDate: String,
        fileName: String,
        epubVersion: String,
        metaData: Object,
        title: String,
        impact: Object,
        totalCount: Number,
        cover: Object,
        reportPath: String
    });

    Reports = mongoose.model("Reports", reportSchema, "reports");
    const db = mongoose.connection;

    db.on('error', (err) => console.log('error', 'MongoDB connection error:' + err));
    db.once('open', () => console.log('info', 'Connected to statistic mongo server.'));
}

setUpConnectionToStatisticDB();

/* GET home page. */
router.get('/', function (req, res, next) {

    // stopwatch.start();
    try {
        Reports
            .countDocuments({})
            .exec((err, count) => {

                if (err)
                    throw new Error(err.toString());


                Reports
                    .find()
                    .sort({_id: -1})
                    .limit(300)
                    .exec((err, reports) => {

                        if (err)
                            throw new Error(err.toString());

                        // console.log(JSON.stringify(reports, null, '\t'));
                        res.render('index', {
                            title: 'BACC Statistics',
                            checks: count + ' checks',
                            rows: prepareStatistics({reports: reports}, req).reports
                        });

                    });

            });

    } catch (e) {
        res.status(500).send(e.message);
        console.error(e) // handle error
    }
});


router.get('/delete', function (req, res, next) {

    const id = req.query['id'];
    if (!id) {
        res.status(400).send('Parameter id is missing!');
        return;
    }

    try {

        Reports.deleteOne({_id: id}, function (err) {
            if (err)
                throw new Error(err);

            res.status(200).send('Report successful deleted');
        });
    } catch (e) {
        res.status(500).send(e.message);
        console.error(e) // handle error
    }
});


function prepareStatistics(statistics, req) {

    statistics.reports.forEach(report => {

        // console.log(report);

        const relativeReportPath = report.reportPath.substr(report.reportPath.indexOf('uploads') + 8);
        const id = relativeReportPath.replace('/bacc_report.html', '').replace('./', '');
        report.ID = id;

        if (report.older) {
            report.totalCount = report.totalCount.match(/\d+/g);
            return;
        }

        report.impact = "<i class=\"material-icons\" style=\"color:" + report.impact.color + "; font-size: 36px\" aria-hidden=\"true\">accessibility</i>";
        report.cover = "<img src=\"" + setHost(req, id + '/data/' + report.cover.src) + "\" alt=\"" + report.cover.alt + "\">";
        report.reportPath = setHost(req, relativeReportPath);
    });
    return statistics;
}

// function getReportsMetaData(req) {
//
//     const files = glob.sync('./**/' + REPORT, {cwd: UPLOADS});
//     console.log("glob: " + stopwatch.elapsed.seconds);
//     jsonfile.writeFileSync('statistics.json', {reports: []}, {spaces: 2});
//
//     console.log("files: " + files.length);
//
//     files.forEach(file => {
//
//         const $ = cheerio.load(fs.readFileSync(path.join(UPLOADS, file)));
//         console.log("cheerio: " + stopwatch.elapsed.seconds + '-' + file);
//
//         const title = $('.bookTitle').text();
//
//         // ignore own test books
//         if (ignore.indexOf(title.trim()) > -1) {
//             return;
//         }
//
//         const id = file.replace('/bacc_report.html', '').replace('./', '');
//         const statistic =
//             {
//                 checkDate: $('.check-date').text().replace('geprüft am: ', ''),
//                 title: title,
//                 impact: $.html('#total-impact-icon'),
//                 totalCount: $('caption').text(),
//                 cover: getCover(req, $, id),
//                 reportPath: setHost(req, file),
//                 older: true
//             };
//
//
//         const current = jsonfile.readFileSync(STATISTICS);
//         current.reports.push(statistic);
//         jsonfile.writeFileSync(STATISTICS, current, {spaces: 2});
//     });
//
// // console.log(statistic);
//
// }

function getCover(req, $, id) {

    var img;

    const cover = $('#images > tbody > tr > td').first().find('img');
    cover.attr('src', setHost(req, id + '/' + cover.attr('src')));
    img = $.html(cover);

    return img || '';
}

function setHost(req, file) {

    var host = req.hostname;
    // return 'http://' + host + ':3111/uploads/' + file;
    return 'http://dzbvm-dacapo.dzbnet.local:3111/uploads/' + file;
}

module.exports = router;
