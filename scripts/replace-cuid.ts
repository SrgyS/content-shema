import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { createId } from '@paralleldrive/cuid2';

const ids = [
  createId(), // 'tz4a98xxat96iws9zmbrgj3a'
  createId(), // 'pfh0haxfpzowht3oi213cqos'
  createId(), // 'nc6bzmkmd014706rfda898to'
];

function replaceCuidInFile(file: string) {
  try {
    let content = fs.readFileSync(file, "utf8");
    const updatedContent = content.replace(/{cuid}/g, () => createId());

    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent, "utf8");
      console.log(`Обновлено: ${file}`);
    }
  } catch (error) {
    console.error(`Ошибка при обновлении файла ${file}:`, error);
  }
}

function watchYAMLFiles(relativePath: string) {
  const directory = path.join(process.cwd(), relativePath);
  const watcher = chokidar.watch(path.join(directory, "**/*.yaml"), {
    ignored: /^\./,
    persistent: true,
    ignoreInitial: false,
  });

  watcher.on("add", (file) => {
    console.log(`Найден новый файл: ${file}`);
    replaceCuidInFile(file);
  });

  // Обработка при изменении файла
  watcher.on("change", (file) => {
    console.log(`Обнаружены изменения в файле: ${file}`);
    replaceCuidInFile(file);
  });
}

function replaceAllCuidInDirectory(directory: string) {
  // Рекурсивно ищем все .yaml файлы
  const walk = (dir: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith('.yaml')) {
        replaceCuidInFile(fullPath);
      }
    }
  };
  walk(directory);
}

// Использование аргумента командной строки для указания относительного пути
const relativePath: string = process.argv[2] || "./test-structure";
const directory = path.join(process.cwd(), relativePath);

replaceAllCuidInDirectory(directory);
watchYAMLFiles(relativePath);