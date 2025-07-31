const Exercise = require('../models/exerciseModel');
const { validateInput } = require('../utils/validation');
const objExercise = new Exercise();
const { parse, format, startOfDay, endOfDay } = require('date-fns');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

exports.getAllExercises = async (req, res, next) => {
  try {
    const { grade } = req.query;
    const filters = {};
    filters.deletedAt = null;
    if (grade) {
      filters.grade = {
        $regex: grade,
        $options: 'i',
      };
    }
    const exercises = await objExercise.model.aggregate([
      {
        $match: filters,
      },
    ]);

    const data = [];
    if (exercises) {
      exercises.map((exercise) => {
        data.push({
          _id: exercise._id,
          grade: exercise.grade,
          series: exercise.series,
          createdDate: format(new Date(exercise.createdAt), 'yyyy-MM-dd'),
        });
      });
    }
    res.status(200).json({
      status: 1,
      message: 'All Exercises',
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getExercise = async (req, res, next) => {
  try {
    const exerciseId = req.params.id;
    const exercise = await objExercise.findById(exerciseId);
    const data = {
      _id: exercise._id,
      grade: exercise.grade,
      series: exercise.series,
      pdfUrl: exercise.pdfUrl,
      missingWords: exercise.missingWords,
      pageInfos: exercise.pageInfos,
    };
    res.status(200).json({
      status: 1,
      message: 'Exercise Details',
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getExerciseDetails = async (req, res, next) => {
  try {
    const exerciseId = req.params.id;
    console.log(exerciseId);
    const exercise = await objExercise.findById(exerciseId);
    const pageInfosData = [];
    const data = {
      id: exercise._id,
      grade: exercise.grade,
      series: exercise.series,
      pdfUrl: exercise.pdfUrl,
      totalPages: exercise.totalPages,
      missingWords: exercise.missingWords,
      pageInfos: exercise.data,
    };

    // exercise.pageInfos.map((pageInfo) => {
    //   const answers = getAnswersForPage(
    //     exercise.pageInfos,
    //     pageInfo,
    //     exercise.missingWords
    //   );
    //   console.log('answer', answers);
    //   data.pageInfos.push({
    //     pageNumber: pageInfo.pageNumber,
    //     audioFiles: pageInfo.audioFiles,
    //     noOfQuestion: pageInfo.noOfQuestion,
    //     answers: answers,
    //   });
    // });
    res.status(200).json({
      status: 1,
      message: 'Exercise Details',
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

// function getAnswersForPage(pageInfos, pageInfo, correctAnswers) {
//   let startIndex = 0;
//   for (let i = 0; i < pageInfos.length; i++) {
//     if (pageInfos[i].pageNumber === pageInfo.pageNumber) break;
//     startIndex += pageInfos[i].noOfQuestion;
//   }
//   const answerCount = pageInfo.noOfQuestion;
//   return correctAnswers.slice(startIndex, startIndex + answerCount);
// }

exports.createExercise = async (req, res, next) => {
  try {
    const insertData = {};
    const exerciseData = JSON.parse(req.body.data);
    const fileIndex = JSON.parse(req.body.fileIndex);
    const files = req.files;
    console.log('Form data:', exerciseData);
    console.log('fileIndex', fileIndex);

    //get PDF File URL
    const pdfFileIndex = fileIndex.findIndex((index) => index == 'pdfFile');
    let pdfUrl = '';
    if (pdfFileIndex !== -1 && files[pdfFileIndex]) {
      let responseData = uploadFileStore('pdf', files[pdfFileIndex]);
      pdfUrl = responseData.url;
    }

    const { errorMsg, isValid } = validateInputFields(exerciseData);
    if (!isValid) {
      return res.status(400).json({
        status: 0,
        message: errorMsg,
      });
    }

    //get pageInfos Data
    const pageInfos = await getPageInfoFormat(
      exerciseData.pageInfos,
      fileIndex,
      files
    );

    insertData.grade = exerciseData.grade;
    insertData.series = exerciseData.series;
    insertData.pdfUrl = pdfUrl;
    insertData.totalPages = exerciseData.totalPages;
    insertData.missingWords = exerciseData.missingWords;
    insertData.pageInfos = pageInfos;
    console.log('insertData', insertData);
    const exerciseId = await objExercise.createEntry(insertData);
    res.status(200).json({
      status: 1,
      message: 'Exercise Created Successfully!',
    });
  } catch (err) {
    next(err);
  }
};

exports.updateExercise = async (req, res, next) => {
  try {
    const exerciseData = req.body;
    const { errorMsg, isValid } = validateInputFields(exerciseData);

    if (!isValid) {
      return res.status(400).json({
        status: 0,
        message: errorMsg,
      });
    }
    const updateRole = await objExercise.updateEntry(
      req.params.id,
      exerciseData
    );
    res.status(200).json({
      status: 1,
      message: 'Exercise Updated Successfully!',
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteExercise = async (req, res, next) => {
  try {
    await objExercise.softDelete(req.params.id);
    res.status(200).json({
      status: 1,
      message: 'Exercise Deleted Successfully!',
    });
  } catch (err) {
    next(err);
  }
};

const validateInputFields = (data) => {
  const requiredFields = [
    'grade',
    'series',
    'pdfFile',
    'totalPages',
    'missingWords',
    'pageInfos',
  ];
  return validateInput(data, requiredFields);
};

const getPageInfoFormat = async (data, fileIndex, files) => {
  const pageInfos = [];
  if (data.length > 0) {
    await data.map((page, index) => {
      const pageAudioFiles = [];
      if (page.audioFiles.length > 0) {
        page.audioFiles.map((audio, audioIndex) => {
          let audioFileIndex = fileIndex.findIndex(
            (index) => index == `audio_${page.pageNumber}_${audioIndex}`
          );

          let audioUrl = '';
          if (audioFileIndex !== -1 && files[audioFileIndex]) {
            let responseData = uploadFileStore('audio', files[audioFileIndex]);
            audioUrl = responseData.url;
          }
          pageAudioFiles.push({
            name: audio.name,
            size: audio.size,
            url: audioUrl,
            duration: audio.duration,
          });
          // console.log('pageAudioFiles', pageAudioFiles);
        });
      }
      pageInfos.push({
        pageNumber: page.pageNumber,
        audioFiles: pageAudioFiles,
      });
    });
  }
  return pageInfos;
};

// const upload = multer({ dest: 'uploads/' });
const uploadFileStore = (fileType, file) => {
  try {
    if (!file || !file.originalname || !file.path) {
      throw new Error('Invalid file object');
    }
    const { originalname, path: tempPath } = file;
    console.log(file);
    const publicDir = path.join(__dirname, `../../public/${fileType}`);

    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const newPath = path.join(publicDir, originalname);
    fs.renameSync(tempPath, newPath);
    const filePath = `/${fileType}/${originalname}`;

    return { status: 1, url: filePath, error: '' };
  } catch (err) {
    return { status: 0, url: '', error: err.message };
  }
};
