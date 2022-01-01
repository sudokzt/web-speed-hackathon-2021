const sharp = require('sharp');
const fs = require('fs');
const fsPromise = fs.promises;
const glob = require('glob');
const path = require('path');
const mkdirp = require('mkdirp');

const ORIGINAL_IMG_DIR = glob.sync('../public/images/*'); // 変換前の画像のディレクトリ
const IMG_DIR_ARRAY = ORIGINAL_IMG_DIR.map((imgDirPath) => imgDirPath.split('/', 4)[3]); // original/以下のディレクトリ
const WEBP_IMG_DIR = '../public/images/webp/'; // WebP変換後のディレクトリ
const WEBP_IMG_DIR_ARRAY = IMG_DIR_ARRAY.map((name) => WEBP_IMG_DIR + name); // WebP変換後の画像を入れるディレクトリ
console.log(WEBP_IMG_DIR_ARRAY);

/**
 * 画像をWebP形式に変換
 * @param {string} imgPath 元画像のフルパス
 * @param {string} outputDir 出力先のディレクトリ
 * @param {string} outputFilePath 出力するファイルパス
 */
const changeWebpImages = (imgPath, outputDir, outputFilePath) => {
  const fileName = outputFilePath.split('/').reverse()[0]; // 拡張子を含む画像ファイル名
  const imgName = fileName.split('.')[0]; // 拡張子を除く画像ファイル名

  console.log({ imgPath, fileName, imgName, outputDir });

  sharp(imgPath)
    .webp({
      quality: 75,
    })
    .toFile(`${outputDir}${imgName}.webp`, (err) => {
      // 画像ファイル名.webpで出力
      if (err) console.error(err);
      return;
    });
};

/**
 * 変換後の画像を格納するディレクトリを生成
 */
async function createWebpDir() {
  WEBP_IMG_DIR_ARRAY.forEach((pathName) => {
    mkdirp.sync(pathName);
  });
}

/**
 * 元画像のファイル情報を読み取ってWebPに変換する関数を実行
 */
async function writeFiles() {
  ORIGINAL_IMG_DIR.forEach((dirName, i) => {
    const resolvedPath = path.resolve(dirName);
    fsPromise
      .readdir(resolvedPath)
      .then((files) => {
        files.forEach((file) => {
          changeWebpImages(
            `${resolvedPath}/${file}`,
            `${path.resolve(WEBP_IMG_DIR_ARRAY[i])}/`,
            `${path.resolve(WEBP_IMG_DIR_ARRAY[i])}/${file}`,
          );
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
}

async function init() {
  await createWebpDir();
  await writeFiles();
}

init();
