import { TrKey, TrStrKey } from './keys';

export function generate(TransformFunc: (key: TrKey) => string): {
  [index: string]: string;
} {
  return {
    [TransformFunc(TrKey.TEXT)]: '{{text}}',
    [TransformFunc(TrKey.UNKONWN_USER)]: '❗ Незарегистрированный пользователь',
    [TransformFunc(TrKey.USER_GONE)]:
      '❗ Пользователь "{{first_name}}" пропал во время операции',
    [TransformFunc(
      TrKey.INVALID_SET_LANG_CMD,
    )]: `Текущий язык "{{languageCode}}"
❗ Неправильная команда для установки языка, пример:`,
    [TransformFunc(TrKey.INVALID_LANGUAGE)]:
      '❗ Язык должен быть один из "{{languages}}" но не "{{language}}"',
    [TransformFunc(TrKey.LANGUAGE_UPDATED)]:
      'Язык "{{oldLanguage}}" обновлен на "{{newLanguage}}"',
    [TransformFunc(
      TrKey.YOU_ARE_ALLOWED_TO_USE,
    )]: `🎉 Вы зарегистрированы и можете использовать бота!
Посмотреть список всех команд /help
Установить временную зону /settimezone
Установить день начала недели /setweekstartson`,
    [TransformFunc(TrKey.INVALID_ADD_CTG_CMD)]:
      '❗ Неправильная команда для добавления категории, пример:',
    [TransformFunc(TrKey.INVALID_UPDN_CTG_CMD)]:
      '❗ Неправильная команда для обновления имени категории, пример:',
    [TransformFunc(TrKey.INVALID_UPDD_CTG_CMD)]:
      '❗ Неправильная команда для обновления описания категории, пример:',
    [TransformFunc(TrKey.INVALID_DEL_CTG_CMD)]:
      '❗ Неправильная команда для удаления категории, пример:',
    [TransformFunc(TrKey.CATEGORY_EXISTS)]:
      '❗ Категория с именем "{{title}}" уже используется',
    [TransformFunc(TrKey.TITLE_EXISTS_IN_SUBCTG)]:
      '❗ Имя "{{title}}" уже используется в подкатегории',
    [TransformFunc(TrKey.RES_CTG_ADDED)]: `Категория добавлена
Созданные поля:
{{createdFields}}`,
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_ID)]: '🆔 "{{ctgId}}"',
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_TYPE)]: 'Тип "{{ctgType}}"',
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_TITLE)]: 'Имя "{{ctgTitle}}"',
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_DESCR)]: 'Описание "{{ctgDescr}}"',
    [TransformFunc(
      TrKey.CTG_TITLE_MAX_ERROR,
    )]: `❗ Имя категории не должно превышать "{{max}}" символов`,
    [TransformFunc(
      TrKey.CTG_DESC_MAX_ERROR,
    )]: `❗ Описание категории не должно превышать "{{max}}" символов (включая пробелы)`,
    [TransformFunc(TrKey.YOUR_CATEGORIES)]: `Ваши категории:
{{text}}`,
    [TransformFunc(TrKey.NO_CATEGORIES)]: 'Нет категорий',
    [TransformFunc(TrKey.CTG_NOT_EXISTS_BY_ID)]:
      '❗ Категории с  🆔 "{{id}}" не существует',
    [TransformFunc(TrKey.CTG_NOT_EXISTS_BY_TITLE)]:
      '❗ Категории с именем "{{title}}" не существует',
    [TransformFunc(TrKey.CATEGORY_NAME_UPDATED)]:
      'Категория с именем "{{oldTitle}}" обновлена на имя "{{newTitle}}"',
    [TransformFunc(TrKey.CATEGORY_DESC_UPDATED)]:
      'Категория "{{ctgTitle}}" с описанием "{{oldDesc}}" обновлена на описание "{{newDesc}}"',
    [TransformFunc(TrKey.CTG_DELETED)]: 'Категория "{{title}}" удалена',
    [TransformFunc(TrKey.CTG_DELETED_WITH_SBC)]:
      'Категория с именем "{{title}}" и подкатегории "{{sbcTitles}}" удалены',
    [TransformFunc(TrKey.CTG_DELETED_WITH_SBC_AND_NT)]:
      'Категория "{{title}}" и подкатегории "{{sbcTitles}}" и записи "{{ntIds}}" удалены',
    [TransformFunc(TrKey.CTG_DELETED_WITH_NT)]:
      'Категория "{{title}}" и записи "{{ntIds}}" удалены',
    [TransformFunc(TrKey.CATEGORY_GONE)]:
      '❗ Категория "{{title}}" пропала во время операции',
    [TransformFunc(TrKey.YOUR_NOTES)]: `Ваши записи:
{{text}}`,
    [TransformFunc(TrKey.NO_NOTES)]: 'Нет записей',
    [TransformFunc(TrKey.ERROR_PRONE_STRING)]:
      '❗ Слова не должны начинаться с "{{invTitles}}"',
    [TransformFunc(
      TrKey.INVALID_ADD_SBC_CMD,
    )]: `❗ Неправильная команда для добавления подкатегории, пример:`,
    [TransformFunc(
      TrKey.INVALID_UPDN_SBC_CMD,
    )]: `❗ Неправильная команда для обновления имени подкатегории, пример:`,
    [TransformFunc(
      TrKey.INVALID_UPDD_SBC_CMD,
    )]: `❗ Неправильная команда для обновления описания подкатегории, пример:`,
    [TransformFunc(
      TrKey.INVALID_DEL_SBC_CMD,
    )]: `❗ Неправильная команда для удаления подкатегории, пример:`,
    [TransformFunc(
      TrKey.SBC_TITLE_MAX_ERROR,
    )]: `❗ Имя подкатегории не должно превышать "{{max}}" символов`,
    [TransformFunc(
      TrKey.SBC_DESC_MAX_ERROR,
    )]: `❗ Описание подкатегории не должно превышать "{{max}}" символов (включая пробелы)`,
    [TransformFunc(TrKey.SUBCTG_EXISTS)]:
      '❗ Подкатегория с именем "{{title}}" уже используется',
    [TransformFunc(TrKey.RES_SBC_ADDED)]: `Подкатегория добавлена
Созданные поля:
{{createdFields}}`,
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_ID)]: '🆔 "{{sbcId}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_TITLE)]: 'Имя "{{sbcTitle}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_DESCR)]: 'Описание "{{sbcDescr}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_CTG_TYPE)]:
      'Тип категории "{{ctgType}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_CTG_TITLE)]:
      'Имя категории "{{ctgTitle}}"',
    [TransformFunc(TrKey.YOUR_SUBCATEGORIES)]: `Ваши подкатегории:
{{text}}`,
    [TransformFunc(TrKey.NO_SUBCATEGORIES)]: 'Нет подкатегорий',
    [TransformFunc(TrKey.SBC_NOT_EXISTS_BY_ID)]:
      '❗ Подкатегории с 🆔 "{{id}}" не существует',
    [TransformFunc(TrKey.SBC_NOT_EXISTS_BY_TITLE)]:
      '❗ Подкатегории с именем "{{title}}" не существует',
    [TransformFunc(TrKey.TITLE_EXISTS_IN_CATEGORY)]:
      '❗ Имя "{{title}}" уже используется в категории',
    [TransformFunc(TrKey.SUBCTG_NAME_UPDATED)]:
      'Подкатегория с именем "{{oldTitle}}" обновлена на имя "{{newTitle}}"',
    [TransformFunc(TrKey.SUBCTG_DESC_UPDATED)]:
      'Подкатегория "{{sbcTitle}}" с описанием "{{oldDesc}}" обновлена на описание "{{newDesc}}"',
    [TransformFunc(TrKey.SBC_DELETED)]: 'Подкатегория "{{title}}" удалена',
    [TransformFunc(TrKey.SBC_DELETED_WITH_NT)]:
      'Подкатегория "{{title}}" и записи "{{ntIds}}" удалены',
    [TransformFunc(TrKey.SUBCTG_GONE)]:
      '❗ Подкатегория "{{title}}" пропала во время операции',
    [TransformFunc(TrKey.NOTE_TEXT_EMPTY)]:
      '❗ Не получается определить текст записи "{{text}}"',
    [TransformFunc(
      TrKey.NOTE_TEXT_MAX_ERROR,
    )]: `Текст записи не должен превышать "{{max}}" символов (включая пробелы)
Текущее количество символов "{{count}}"`,
    [TransformFunc(TrKey.NOTE_NUMBER_RANGE_ERROR)]:
      '❗ Число записи должно быть больше чем "{{min}}" и меньше чем "{{max}}"',
    [TransformFunc(TrKey.NOTE_NUMBER_FLOAT_ERROR)]:
      '❗ Число записи "{{number}}" может содержать только 3 знака после запятой',
    [TransformFunc(TrKey.RELATIVE_DAY_OF_MONTH_ERROR)]:
      '❗ Текущий месяц не может иметь следующее число "{{relativeDay}}"',
    [TransformFunc(TrKey.RELATIVE_MONTH_OF_YEAR_ERROR)]:
      '❗ Текущий год не может иметь следующий месяц "{{relativeMonth}}"',
    [TransformFunc(TrKey.RELATIVE_YEAR_ERROR)]:
      '❗ Ошибка параметра для года "{{relativeYear}}"',
    [TransformFunc(TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST)]:
      '❗ Категория "{{title}}" или подкатегория "{{title}}" не существуют',
    [TransformFunc(TrKey.PARAM_TYPE_INT_POS_ERROR)]:
      '❗ Не получается определить целочисленный параметр {{parName}} со значением {{value}}',
    [TransformFunc(TrKey.PARAM_TYPE_BOOL_ERROR)]:
      '❗ Не получается определить булевый параметр {{parName}} со значением {{value}}',
    [TransformFunc(TrKey.PARAM_TYPE_STR_ERROR)]:
      '❗ Не получается определить значение "{{parValue}}" параметра {{parName}} ',
    [TransformFunc(TrKey.PARAM_TYPE_STR_MATCH_ERROR)]:
      '❗ Значение параметра {{parName}} должно быть одним из {{parValues}}',
    [TransformFunc(TrKey.PARAM_TYPE_DATE_ERROR)]:
      '❗ Не получается определить параметр {{parName}} как дату со значением {{parValue}}',
    [TransformFunc(TrKey.PARAM_TYPE_TIME_ERROR)]:
      '❗ Не получается определить параметр {{parName}} как время со значением {{parValue}}',
    [TransformFunc(TrKey.PARAM_TYPE_DATETIME_ERROR)]:
      '❗ Не получается определить параметр {{parName}} как дату и время со значением {{parValue}}',
    [TransformFunc(TrKey.PARAM_CONFLICT_ERROR)]:
      '❗ Параметр "{{parName}}" конфликтует с {{conflictParName}}',
    [TransformFunc(TrKey.PARAM_CONFLICT_BIGGER_ERROR)]:
      '❗ Параметр "{{parName}}" больше чем или равен {{conflictParName}}',
    [TransformFunc(TrKey.PARAM_CONFLICT_LESS_ERROR)]:
      '❗ Параметр "{{parName}}" меньше чем или равен {{conflictParName}}',
    [TransformFunc(TrKey.NOTE_NOT_EXISTS)]:
      '❗ Запись с 🆔 "{{id}}" не существует',
    [TransformFunc(TrKey.NOTE_NUMBER_DELETED)]:
      'Запись с 🆔 "{{id}}" и числом "{{number}}" и текстом "{{text}}" удалена',
    [TransformFunc(TrKey.NOTE_TEXT_DELETED)]:
      'Запись с 🆔 "{{id}}" и текстом "{{text}}" удалена',
    [TransformFunc(
      TrKey.INVALID_DEL_NOTE_CMD,
    )]: `❗ Неправильная команда для удаления записи, пример:`,
    [TransformFunc(
      TrKey.NOTE_FUTURE_DATE_WARNING,
    )]: `⚠ Внимание, запись имеет будущую дату!\n`,
    [TransformFunc(TrKey.NOTE_ADDED)]: `{{futureDateMsg}}Запись добавлена
Созданные поля:
{{createdFields}}`,
    [TransformFunc(TrKey.NOTE_FIELD_ID_ADDED)]: '🆔 "{{noteId}}"',
    [TransformFunc(TrKey.NOTE_FIELD_DATETIME_ADDED)]:
      'Дата и время "{{noteDatetime}}"',
    [TransformFunc(TrKey.NOTE_FIELD_NUMBER_ADDED)]: 'Число "{{noteNumber}}"',
    [TransformFunc(TrKey.NOTE_FIELD_TEXT_ADDED)]: 'Текст "{{noteText}}"',
    [TransformFunc(TrKey.NOTE_FIELD_CATEGORY_ADDED)]:
      'Категория "{{noteCategoryTitle}}"',
    [TransformFunc(TrKey.NOTE_FIELD_SUBCATEGORY_ADDED)]:
      'Подкатегория "{{noteSubcategoryTitle}}"',
    [TransformFunc(
      TrKey.NOTE_UPDATED,
    )]: `{{futureDateMsg}}Запись с 🆔 "{{id}}" обновлена
Обновленные поля:
{{updatedFields}}`,
    [TransformFunc(TrKey.NOTE_FIELD_DATETIME_UPDATED)]:
      'Дата "{{oldValue}}" ➡️ "{{newValue}}"',
    [TransformFunc(TrKey.NOTE_FIELD_NUMBER_UPDATED)]:
      'Число "{{oldValue}}" ➡️ "{{newValue}}"',
    [TransformFunc(TrKey.NOTE_FIELD_TEXT_UPDATED)]:
      'Текст "{{oldValue}}" ➡️ "{{newValue}}"',
    [TransformFunc(TrKey.NOTE_GONE)]:
      '❗ Запись "{{id}}" пропала во время операции',
    [TransformFunc(TrKey.INVALID_HELP_CMD)]:
      '❗ Неправильная команда для справки, пример:',
    [TransformFunc(TrKey.CMD_HELP_DESC)]: 'показать все команды бота',
    [TransformFunc(TrKey.CMD_HELP_EXAM)]: '{{cmd}} [bf=bool] [cmdName]',
    [TransformFunc(TrKey.CMD_HELP_PARAM)]: `
bf (boolean) - подготовить команды для bot father
cmdName (string) - показать справку по определенной команде`,
    [TransformFunc(TrKey.CMD_CTG_ADD_EXAM)]:
      '{{cmd}} [ctg_type=type] [ctg_t=str] [ctg_d=str] [ctgName] [ctgDescription]',
    [TransformFunc(TrKey.CMD_CTG_ADD_DESC)]: 'добавить новую категорию',
    [TransformFunc(TrKey.CMD_CTG_ADD_PARAM)]: `
ctg_type ({{types}}) - тип категории
ctg_t (string) - имя категории
ctg_d (string) - описание категории
ctgName (string) - имя категории
ctgDescription (string) - описание категории`,
    [TransformFunc(TrKey.CMD_CTG_LIST_EXAM)]:
      '{{cmd}} [l=int] [s=int] [show_id=bool] [show_del=bool] [show_arch=bool] [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [ctg_qid_gt=int] [ctg_qid_gte=int] [ctg_qid_lt=int] [ctg_qid_lte=int] [sbc_qid_gt=int] [sbc_qid_gte=int] [sbc_qid_lt=int] [sbc_qid_lte=int] [queryText]',
    [TransformFunc(TrKey.CMD_CTG_LIST_DESC)]: 'просмотр последних 30 категорий',
    [TransformFunc(TrKey.CMD_CTG_LIST_PARAM)]: `
l (integer) - лимит категорий
s (integer) - пропустить категории
show_id (boolean) - показать id категорий
show_del (boolean) - показать удаленные категории
show_arch (boolean) - показать заархивированные категории
q (string) - отфильтровать категории по имени/описанию категории/подкатегории или тексту записи
ctg_q (string) - отфильтровать категории по имени/описанию категории
sbc_q (string) - отфильтровать категории по имени/описанию подкатегории
ctg_qt (string) - отфильтровать категории по имени категории
sbc_qt (string) - отфильтровать категории по имени подкатегории
ctg_qd (string) - отфильтровать категории по описанию категории
sbc_qd (string) - отфильтровать категории по описанию подкатегории
ctg_qid_gt (integer) - отфильтровать категории по id категории больше чем
ctg_qid_gte (integer) - отфильтровать категории по id категории больше чем или равно
ctg_qid_lt (integer) - отфильтровать категории по id категории меньше чем
ctg_qid_lte (integer) - отфильтровать категории по id категории меньше чем или равно
sbc_qid_gt (integer) - отфильтровать категории по id подкатегории больше чем
sbc_qid_gte (integer) - отфильтровать категории по id подкатегории больше чем или равно
sbc_qid_lt (integer) - отфильтровать категории по id подкатегории меньше чем
sbc_qid_lte (integer) - отфильтровать категории по id подкатегории меньше чем или равно
queryText (string) - отфильтровать категории по имени/описанию категории/подкатегории или тексту записи`,
    [TransformFunc(TrKey.CMD_CTG_UPDN_EXAM)]: '{{cmd}} [oldName] [newName]',
    [TransformFunc(TrKey.CMD_CTG_UPDN_DESC)]: 'обновить имя категории',
    [TransformFunc(TrKey.CMD_CTG_UPDN_PARAM)]: `
(oldName - старое имя категории,
newName - новое имя категории)`,
    [TransformFunc(TrKey.CMD_CTG_UPDD_EXAM)]: '{{cmd}} [ctgName] [newDescr]',
    [TransformFunc(TrKey.CMD_CTG_UPDD_DESC)]: 'обновить описание категории',
    [TransformFunc(TrKey.CMD_CTG_UPDD_PARAM)]: `
(ctgName - имя категории,
newDescr - новое описание категории)`,
    [TransformFunc(TrKey.CMD_CTG_DEL_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_CTG_DEL_DESC)]: 'удалить категорию',
    [TransformFunc(TrKey.CMD_CTG_DEL_PARAM)]: `
ctg_id (integer) - id категории
ctg_t (string) - имя категории
ctgName (string) - имя категории`,
    [TransformFunc(TrKey.CMD_SBC_ADD_EXAM)]:
      '{{cmd}} [ctg_t=str] [sbc_t=str] [sbc_d=str] [sbcName] [sbcDescription]',
    [TransformFunc(TrKey.CMD_SBC_ADD_DESC)]:
      'добавить новую подкатегорию для категории',
    [TransformFunc(TrKey.CMD_SBC_ADD_PARAM)]: `
ctg_t (string) - имя категории
sbc_t (string) - имя подкатегории
sbc_d (string) - описание подкатегории
sbcName (string) - имя подкатегории
sbcDescription (string) - описание подкатегории`,
    [TransformFunc(TrKey.CMD_SBC_LIST_EXAM)]:
      '{{cmd}} [l=int] [s=int] [show_id=bool] [show_del=bool] [show_arch=bool] [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [ctg_qid_gt=int] [ctg_qid_gte=int] [ctg_qid_lt=int] [ctg_qid_lte=int] [sbc_qid_gt=int] [sbc_qid_gte=int] [sbc_qid_lt=int] [sbc_qid_lte=int] [queryText]',
    [TransformFunc(TrKey.CMD_SBC_LIST_DESC)]:
      'просмотр последних 30 подкатегорий',
    [TransformFunc(TrKey.CMD_SBC_LIST_PARAM)]: `
l (integer) - лимит подкатегорий
s (integer) - пропустить подкатегории
show_id (boolean) - показать id подкатегорий
show_del (boolean) - показать удаленные подкатегории
show_arch (boolean) - показать заархивированные подкатегории
q (string) - отфильтровать подкатегории по имени/описанию категории/подкатегории или тексту записи
ctg_q (string) - отфильтровать подкатегории по имени/описанию категории
sbc_q (string) - отфильтровать подкатегории по имени/описанию подкатегории
ctg_qt (string) - отфильтровать подкатегории по имени категории
sbc_qt (string) - отфильтровать подкатегории по имени подкатегории
ctg_qd (string) - отфильтровать подкатегории по описанию категории
sbc_qd (string) - отфильтровать подкатегории по описанию подкатегории
ctg_qid_gt (integer) - отфильтровать подкатегории по id категории больше чем
ctg_qid_gte (integer) - отфильтровать подкатегории по id категории больше чем или равно
ctg_qid_lt (integer) - отфильтровать подкатегории по id категории меньше чем
ctg_qid_lte (integer) - отфильтровать подкатегории по id категории меньше чем или равно
sbc_qid_gt (integer) - отфильтровать подкатегории по id подкатегории больше чем
sbc_qid_gte (integer) - отфильтровать подкатегории по id подкатегории больше чем или равно
sbc_qid_lt (integer) - отфильтровать подкатегории по id подкатегории меньше чем
sbc_qid_lte (integer) - отфильтровать подкатегории по id подкатегории меньше чем или равно
queryText (string) - отфильтровать подкатегории по имени/описанию категории/подкатегории или тексту записи`,
    [TransformFunc(TrKey.CMD_SBC_UPDN_EXAM)]: '{{cmd}} [oldName] [newName]',
    [TransformFunc(TrKey.CMD_SBC_UPDN_DESC)]: 'обновить имя подкатегории',
    [TransformFunc(TrKey.CMD_SBC_UPDN_PARAM)]: `
(oldName - старое имя подкатегории,
newName - новое имя подкатегории)`,
    [TransformFunc(TrKey.CMD_SBC_UPDD_EXAM)]:
      '{{cmd}} [sbcName] [newDescription]',
    [TransformFunc(TrKey.CMD_SBC_UPDD_DESC)]: 'обновить описание подкатегории',
    [TransformFunc(TrKey.CMD_SBC_UPDD_PARAM)]: `
(sbcName - имя подкатегории,
newDescription - новое описание подкатегории)`,
    [TransformFunc(TrKey.CMD_SBC_DEL_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_SBC_DEL_DESC)]: 'удалить подкатегорию',
    [TransformFunc(TrKey.CMD_SBC_DEL_PARAM)]: `
sbc_id (integer) - id подкатегории
sbc_t (string) - имя подкатегории
sbcName (string) - имя подкатегории`,
    [TransformFunc(TrKey.INVALID_ADD_NT_CMD)]:
      '❗ Неправильная команда для добавления записи, например:',
    [TransformFunc(TrKey.CMD_NT_ADD_EXAM)]:
      '{{cmd}} [d=date] [t=time] [dt=datetime] [rd=int] [nt_n=float] [nt_t=str] [ctg_id=int] [ctg_t=str] [sbc_id=int] [sbc_t=str]',
    [TransformFunc(TrKey.CMD_NT_ADD_DESC)]: 'добавить новую запись',
    [TransformFunc(TrKey.CMD_NT_ADD_PARAM)]: `
d (date) - дата записи
t (time) - время записи
dt (datetime) - дата и время записи
rd (integer) - день месяца записи (+1 для следующего дня, -1 для предыдущего дня, 2 - для 2-го дня текущего месяца)
nt_n (float) - число записи
nt_t (string) - текст записи
ctg_id (integer) - id категории
ctg_t (string) - имя категории
sbc_id (integer) - id подкатегории
sbc_t (string) - имя подкатегории`,
    [TransformFunc(TrKey.CMD_NT_LIST_EXAM)]:
      '{{cmd}} [l=int] [s=int] [d=date] [s_d=date] [e_d=date] [show_id=bool] [show_del=bool] [show_arch=bool] [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [nt_qt=str] [nt_qn=float] [nt_qn_gt=int] [nt_qn_gte=int] [nt_qn_lt=int] [nt_qn_lte=int] [nt_qid_gt=int] [nt_qid_gte=int] [nt_qid_lt=int] [nt_qid_lte=int] [ctg_qid_gt=int] [ctg_qid_gte=int] [ctg_qid_lt=int] [ctg_qid_lte=int] [sbc_qid_gt=int] [sbc_qid_gte=int] [sbc_qid_lt=int] [sbc_qid_lte=int] [rd=int] [rm=int] [ry=int] [queryText]',
    [TransformFunc(TrKey.CMD_NT_LIST_DESC)]: 'просмотр последних 10 записей',
    [TransformFunc(TrKey.CMD_NT_LIST_PARAM)]: `
l (integer) - лимит записей
s (integer) - пропустить записи
d (date) - отфильтровать записи по дате записи
s_d (date) - отфильтровать записи по дате записи начиная с
e_d (date) - отфильтровать записи по дате записи заканчивая
show_id (boolean) - показать id записей
show_del (boolean) - показать удаленные записи
show_arch (boolean) - показать заархивированные записи
q (string) - отфильтровать записи по имени/описанию категории/подкатегории или тексту записи
ctg_q (string) - отфильтровать записи по имени/описанию категории
sbc_q (string) - отфильтровать записи по имени/описанию подкатегории
ctg_qt (string) - отфильтровать записи по имени категории
sbc_qt (string) - отфильтровать записи по имени подкатегории
ctg_qd (string) - отфильтровать записи по описанию категории
sbc_qd (string) - отфильтровать записи по описанию подкатегории
nt_qt (string) - отфильтровать записи по тексту записи
nt_qn (float) - отфильтровать записи по числу записи
nt_qn_gt (integer) - отфильтровать записи по числу записи больше чем
nt_qn_gte (integer) - отфильтровать записи по числу записи больше чем или равно
nt_qn_lt (integer) - отфильтровать записи по числу записи меньше чем
nt_qn_lte (integer) - отфильтровать записи по числу записи меньше чем или равно
nt_qid_gt (integer) - отфильтровать записи по id записи больше чем
nt_qid_gte (integer) - отфильтровать записи по id записи больше чем или равно
nt_qid_lt (integer) - отфильтровать записи по id записи меньше чем
nt_qid_lte (integer) - отфильтровать записи по id записи меньше чем или равно
ctg_qid_gt (integer) - отфильтровать записи по id категории больше чем
ctg_qid_gte (integer) - отфильтровать записи по id категории больше чем или равно
ctg_qid_lt (integer) - отфильтровать записи по id категории меньше чем
ctg_qid_lte (integer) - отфильтровать записи по id категории меньше чем или равно
sbc_qid_gt (integer) - отфильтровать записи по id подкатегории больше чем
sbc_qid_gte (integer) - отфильтровать записи по id подкатегории больше чем или равно
sbc_qid_lt (integer) - отфильтровать записи по id подкатегории меньше чем
sbc_qid_lte (integer) - отфильтровать записи по id подкатегории меньше чем или равно
rd (integer) - день месяца (+1 для следующего дня, -1 для предыдущего дня, 2 - для 2-го дня текущего месяца)
rm (integer) - месяц года (+1 для следующего месяца, -1 для предыдущего месяца, 2 - для 2-го месяца текущего года)
ry (integer) - год (+1 для следующего года, -1 для предыдущего года, 1023 - для заданного года)
queryText (string) - отфильтровать записи по имени/описанию категории/подкатегории или тексту записи`,
    [TransformFunc(TrKey.CMD_UPDNT_EXAM)]:
      '{{cmd}} [nt_id=int] [d=date] [t=time] [dt=datetime] [rd=int] [nt_n=float] [nt_t=str]',
    [TransformFunc(TrKey.CMD_UPDNT_DESC)]: 'обновить запись',
    [TransformFunc(TrKey.CMD_UPDNT_PARAM)]: `
id (integer) - id записи
d (date) - дата записи
t (time) - время записи
dt (datetime) - дата и время записи
rd (integer) - день месяца записи (+1 для следующего дня, -1 для предыдущего дня, 2 - для 2-го дня текущего месяца)
nt_n (float) - число записи
nt_t (string) - текст записи`,
    [TransformFunc(TrKey.CMD_NT_DEL_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_DEL_DESC)]: 'удалить запись',
    [TransformFunc(TrKey.CMD_NT_DEL_PARAM)]: `
nt_id (integer) - id записи
ntId (integer) - id записи`,
    [TransformFunc(TrKey.CMD_SET_LANG_EXAM)]: '{{cmd}} [lang]',
    [TransformFunc(TrKey.CMD_SET_LANG_DESC)]: 'установить язык сообщений бота',
    [TransformFunc(TrKey.CMD_SET_LANG_PARAM)]: `
(lang - языковой код, один из [{{languages}})])`,
    [TransformFunc(TrKey.LIST_HEADER_LIMIT)]: `(лимит "{{limitNum}}")`,
    [TransformFunc(TrKey.LIST_HEADER_SKIP)]: `(пропустить "{{skipNum}}")`,
    [TransformFunc(TrKey.LIST_HEADER_SHOW_ID)]: `(показывать id)`,
    [TransformFunc(TrKey.LIST_HEADER_SHOW_DEL)]: `(в удаленных)`,
    [TransformFunc(
      TrKey.LIST_HEADER_START_DT,
    )]: `(начиная с даты "{{startDateTime}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_END_DT,
    )]: `(заканчивая датой "{{endDateTime}}")`,
    [TransformFunc(TrKey.LIST_HEADER_QUERY)]: `(шаблон поиска "{{query}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_QUERY,
    )]: `(поиск по категориям "{{ctgQuery}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_QUERY_TITLE,
    )]: `(поиск по названию категорий "{{ctgQueryTitle}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_QUERY_DESCR,
    )]: `(поиск по описанию категорий "{{ctgQueryDescr}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_QUERY,
    )]: `(поиск по подкатегориям "{{sbcQuery}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_QUERY_TITLE,
    )]: `(поиск по названию подкатегорий "{{sbcQueryTitle}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_QUERY_DESCR,
    )]: `(поиск по описанию подкатегорий "{{sbcQueryDescr}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_QUERY_TEXT,
    )]: `(поиск по тексту записи "{{ntQueryText}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_QUERY_NUMBER,
    )]: `(поиск по числу записи "{{ntQueryNumber}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_GREATER_THAN,
    )]: `(поиск по числу записи которое больше чем "{{ntQueryNumberGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_GREATER_THAN_OR_EQUAL,
    )]: `(поиск по числу записи которое больше чем или равно "{{ntQueryNumberGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_LESS_THAN,
    )]: `(поиск по числу записи которое меньше чем "{{ntQueryNumberLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_LESS_THAN_OR_EQUAL,
    )]: `(поиск по числу записи которое меньше чем или равно "{{ntQueryNumberLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_GREATER_THAN,
    )]: `(поиск по категориям id которых больше чем "{{ctgQueryIdGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_GREATER_THAN_OR_EQUAL,
    )]: `(поиск по категориям id которых больше чем или равно "{{ctgQueryIdGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_LESS_THAN,
    )]: `(поиск по категориям id которых меньше чем "{{ctgQueryIdLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_LESS_THAN_OR_EQUAL,
    )]: `(поиск по категориям id которых меньше чем или равно "{{ctgQueryIdLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_GREATER_THAN,
    )]: `(поиск по подкатегориям id которых больше чем "{{sbcQueryIdGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_GREATER_THAN_OR_EQUAL,
    )]: `(поиск по подкатегориям id которых больше чем или равно "{{sbcQueryIdGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_LESS_THAN,
    )]: `(поиск по подкатегориям id которых меньше чем "{{sbcQueryIdLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_LESS_THAN_OR_EQUAL,
    )]: `(поиск по подкатегориям id которых меньше чем или равно "{{sbcQueryIdLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_GREATER_THAN,
    )]: `(поиск по записям id которых больше чем "{{ntQueryIdGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_GREATER_THAN_OR_EQUAL,
    )]: `(поиск по записям id которых больше чем или равно "{{ntQueryIdGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_LESS_THAN,
    )]: `(поиск по записям id которых меньше чем "{{ntQueryIdLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_LESS_THAN_OR_EQUAL,
    )]: `(поиск по записям id которых меньше чем или равно "{{ntQueryIdLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_COUNT,
    )]: `(количество категорий "{{ctgCount}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_COUNT,
    )]: `(количество подкатегорий "{{sbcCount}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_COUNT,
    )]: `(количество записей "{{ntCount}}")`,
    [TransformFunc(TrKey.CALC_SUMMARY)]: `Всего: {{text}}`,
    [TransformFunc(TrKey.EMPTY_SUMMARY)]: `Статистика отсутствует`,
    [TransformFunc(
      TrKey.INVALID_SET_TIMEZONE_CMD,
    )]: `Текущий часовой пояс "{{timeZone}}"
❗ Неправильная команда для установки часового пояса, пример:`,
    [TransformFunc(
      TrKey.TIME_ZONE_MAX_ERROR,
    )]: `❗ Имя часового пояса не должно превышать "{{max}}" символов на английском языке`,
    [TransformFunc(
      TrKey.TIME_ZONE_UPDATED,
    )]: `Часовой пояс обновлен с "{{oldTimeZone}}" на "{{newTimeZone}}"`,
    [TransformFunc(
      TrKey.TIME_ZONE_FIND_ERROR,
    )]: `❗ Не получается найти часовой пояс по тексту "{{text}}"`,
    [TransformFunc(
      TrKey.TIME_ZONE_AMB_ERROR,
    )]: `❗ Попробуйте уточнить поиск, слишком много вариантов:
{{timeZones}}`,
    [TransformFunc(TrKey.CMD_SET_TIMEZONE_EXAM)]: '{{cmd}} [timeZone]',
    [TransformFunc(TrKey.CMD_SET_TIMEZONE_DESC)]:
      'установить часовой пояс пользователя',
    [TransformFunc(TrKey.CMD_SET_TIMEZONE_PARAM)]: `
(timeZone - часовой пояс, например "{{timeZone}}")`,
    [TransformFunc(TrKey.CMD_SET_WEEKS_STARTS_ON_EXAM)]:
      '{{cmd}} [weekStartsOn]',
    [TransformFunc(TrKey.CMD_SET_WEEKS_STARTS_ON_DESC)]:
      'установить день начала недели',
    [TransformFunc(TrKey.CMD_SET_WEEKS_STARTS_ON_PARAM)]: `
(weekStartsOn - день начала недели, например "0" - Воскресенье, "1" - Понедельник)`,
    [TransformFunc(
      TrKey.INVALID_SET_WEEK_STARTS_ON_CMD,
    )]: `Текущий день начала недели "{{weekStartsOn}}"
❗ Неправильная команда для установки дня начала недели, например:`,
    [TransformFunc(
      TrKey.INVALID_WEEK_STARTS_ON,
    )]: `❗ День начала недели должен быть один из "0|1|2|3|4|5|6" но не "{{weekStartsOn}}"`,
    [TransformFunc(
      TrKey.WEEK_STARTS_ON_UPDATED,
    )]: `День начала недели "{{oldWeeksStartsOn}}" обновлен на "{{newWeeksStartsOn}}"`,
    [TransformFunc(
      TrKey.CALC_BALANCE,
    )]: `Баланс до {{endDateTime}} является {{balance}}`,
    [TransformFunc(
      TrKey.PARAM_DUPLICATE_ERROR,
    )]: `❗ Дублирование параметров команды "{{parName}}"`,
    [TransformFunc(
      TrKey.PARAM_AMBIGUOUS_ERROR,
    )]: `❗ Командный параметр {{parName}} неоднозначен, из-за введенного текста`,
    [TransformFunc(TrKey.INVALID_STATS_CMD)]:
      '❗ Неправильная команда для получения статистики, например:',
    [TransformFunc(TrKey.CMD_STATS_EXAM)]:
      '{{cmd}} [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [nt_qt=str] [d=date] [s_d=date] [e_d=date] [rd=int] [rm=int] [ry=int] [queryText]',
    [TransformFunc(TrKey.CMD_STATS_DESC)]: 'получить статистику',
    [TransformFunc(TrKey.CMD_STATS_PARAM)]: `
q (string) - отфильтровать статистику по имени/описанию категории/подкатегории или тексту записи
ctg_q (string) - отфильтровать статистику по имени/описанию категории
sbc_q (string) - отфильтровать статистику по имени/описанию подкатегории
ctg_qt (string) - отфильтровать статистику по имени категории
sbc_qt (string) - отфильтровать статистику по имени подкатегории
ctg_qd (string) - отфильтровать статистику по описанию категории
sbc_qd (string) - отфильтровать статистику по описанию подкатегории
nt_qt (string) - отфильтровать статистику по тексту записи
d (date) - отфильтровать статистику по дате записи
s_d (date) - отфильтровать статистику по дате записи начиная с
e_d (date) - отфильтровать статистику по дате записи заканчивая
rd (integer) - день месяца статистики (+1 для следующего дня, -1 для предыдущего дня, 2 - для 2-го дня текущего месяца)
rm (integer) - месяц года статистики (+1 для следующего месяца, -1 для предыдущего месяца, 2 - для 2-го месяца текущего года)
ry (integer) - год статистики (+1 для следующего года, -1 для предыдущего года, 1023 - для заданного года)
queryText (string) - отфильтровать статистику по имени/описанию категории/подкатегории или тексту записи`,
    [TransformFunc(TrKey.SETTINGS)]: `Версия бота "{{botVersion}}"
id пользователя "{{userId}}"
id комнаты "{{peerId}}"
квота "{{quota}}"
Текущий язык "{{languageCode}}"
Текущий часовой пояс "{{timeZone}}"
Текущий день начала недели "{{weekStartsOn}}"`,
    [TransformFunc(TrKey.CMD_SETTINGS_EXAM)]: '{{cmd}}',
    [TransformFunc(TrKey.CMD_SETTINGS_DESC)]: 'показать текущие настройки',
    [TransformFunc(TrKey.CMD_SETTINGS_PARAM)]: ``,
    [TransformFunc(
      TrKey.INVALID_UPDNT_CMD,
    )]: `❗ Неправильная команда для обновления записи, например:`,
    [TransformFunc(
      TrKey.INVALID_APPNTT_CMD,
    )]: `❗ Неправильная команда для добавления текста записи, например:`,
    [TransformFunc(TrKey.CMD_NT_APPT_EXAM)]:
      '{{cmd}} [ntId] [ntText] [nt_id=int] [nt_t=str]',
    [TransformFunc(TrKey.CMD_NT_APPT_DESC)]: 'добавить текст записи',
    [TransformFunc(TrKey.CMD_NT_APPT_PARAM)]: `
nt_id (integer) - id записи
nt_t (string) - текст записи
ntId (integer) - id записи
ntText (string) - текст записи`,
    [TransformFunc(
      TrKey.INVALID_TRNSNT_CMD,
    )]: `❗ Неправильная команда для переноса записи, например:`,
    [TransformFunc(TrKey.CMD_TRNSNT_EXAM)]: '{{cmd}} [id] [newCtgOrSbc]',
    [TransformFunc(TrKey.CMD_TRNSNT_DESC)]: '⚠ перенос записи',
    [TransformFunc(TrKey.CMD_TRNSNT_PARAM)]: `
(id - id записи
newCtgOrSbc - новая категория или подкатегория записи)`,
    [TransformFunc(
      TrKey.INVALID_TRNSNTS_CMD,
    )]: `❗ Неправильная команда для переноса записей, например:`,
    [TransformFunc(TrKey.CMD_TRNSNTS_EXAM)]: '{{cmd}} [ctgOrSbc] [newCtgOrSbc]',
    [TransformFunc(TrKey.CMD_TRNSNTS_DESC)]: '⚠ перенос записей',
    [TransformFunc(TrKey.CMD_TRNSNTS_PARAM)]: `
(ctgOrSbc - существующая категория или подкатегория записей
newCtgOrSbc - новая категория или подкатегория записей)`,
    [TransformFunc(
      TrKey.CTG_TYPE_TRANSFER_ERROR,
    )]: `❗ Вы не можете изменять тип категории у записей с текстовой на числовую и наоборот`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_CTG_TO_CTG,
    )]: `Записи "{{ntIds}}" перенесены из категории "{{fromTitle}}" в категорию "{{toTitle}}"`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_CTG_TO_SBC,
    )]: `Записи "{{ntIds}}" перенесены из категории "{{fromTitle}}" в подкатегорию "{{toTitle}}"`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_SBC_TO_CTG,
    )]: `Записи "{{ntIds}}" перенесены из подкатегории "{{fromTitle}}" в категорию "{{toTitle}}"`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_SBC_TO_SBC,
    )]: `Записи "{{ntIds}}" перенесены из подкатегории "{{fromTitle}}" в подкатегорию "{{toTitle}}"`,
    [TransformFunc(
      TrKey.EQUAL_TRANSFER_CTG_OR_SBC,
    )]: `❗ Перенос из категории "{{title}}" или подкатегории "{{title}}" не должен совпадать с переносом в категорию "{{title}}" или подкатегорию "{{title}}"`,
    [TransformFunc(
      TrKey.UNHANDLED_MESSAGE,
    )]: `❗ Команда или сообщение не распознано
Посмотерть список всех команд /help`,
    [TransformFunc(TrKey.YOUR_USERS)]: `Ваши пользователи:
{{text}}`,
    [TransformFunc(TrKey.NO_USERS)]: 'Нет пользователей',
    [TransformFunc(
      TrKey.USER_QUOTA_REACHED,
    )]: `⚠ Достигнут лимит бесплатной квоты`,
    [TransformFunc(TrKey.INVALID_UNDO_DEL_CTG_CMD)]:
      '❗ Неправильная команда для отмены удаления категории, пример:',
    [TransformFunc(TrKey.CMD_UNDO_CTG_DEL_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_UNDO_CTG_DEL_DESC)]: 'отменить удаление категории',
    [TransformFunc(TrKey.CMD_UNDO_CTG_DEL_PARAM)]: `
ctg_id (integer) - id категории
ctg_t (string) - имя категории
ctgName (string) - имя категории`,
    [TransformFunc(TrKey.CTG_UNDO_DELETED_WITH_SBC_AND_NT)]:
      'Категория "{{title}}" и подкатегории "{{sbcTitles}}" и записи "{{ntIds}}" восстановлены из удаленных',
    [TransformFunc(TrKey.CTG_UNDO_DELETED_WITH_SBC)]:
      'Категория с именем "{{title}}" и подкатегории "{{sbcTitles}}" восстановлены из удаленных',
    [TransformFunc(TrKey.CTG_UNDO_DELETED_WITH_NT)]:
      'Категория "{{title}}" и записи "{{ntIds}}" восстановлены из удаленных',
    [TransformFunc(TrKey.CTG_UNDO_DELETED)]:
      'Категория "{{title}}" восстановлена из удаленных',
    [TransformFunc(TrKey.INVALID_ARCH_CTG_CMD)]:
      '❗ Неправильная команда для заархивирования категории, пример:',
    [TransformFunc(TrKey.CMD_CTG_ARCH_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_CTG_ARCH_DESC)]: 'заархивировать категорию',
    [TransformFunc(TrKey.CMD_CTG_ARCH_PARAM)]: `
ctg_id (integer) - id категории
ctg_t (string) - имя категории
ctgName (string) - имя категории`,
    [TransformFunc(TrKey.CTG_ARCHIVED_WITH_SBC_AND_NT)]:
      'Категория "{{title}}" и подкатегории "{{sbcTitles}}" и записи "{{ntIds}}" заархивированны',
    [TransformFunc(TrKey.CTG_ARCHIVED_WITH_SBC)]:
      'Категория с именем "{{title}}" и подкатегории "{{sbcTitles}}" заархивированны',
    [TransformFunc(TrKey.CTG_ARCHIVED_WITH_NT)]:
      'Категория "{{title}}" и записи "{{ntIds}}" заархивированны',
    [TransformFunc(TrKey.CTG_ARCHIVED)]:
      'Категория "{{title}}" заархивированна',
    [TransformFunc(TrKey.INVALID_UNDO_ARCH_CTG_CMD)]:
      '❗ Неправильная команда для отмены заархивирования категории, пример:',
    [TransformFunc(TrKey.CMD_UNDO_CTG_ARCH_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_UNDO_CTG_ARCH_DESC)]:
      'отменить заархивирование категории',
    [TransformFunc(TrKey.CMD_UNDO_CTG_ARCH_PARAM)]: `
ctg_id (integer) - id категории
ctg_t (string) - имя категории
ctgName (string) - имя категории`,
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED_WITH_SBC_AND_NT)]:
      'Категория "{{title}}" и подкатегории "{{sbcTitles}}" и записи "{{ntIds}}" восстановлены из заархивированных',
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED_WITH_SBC)]:
      'Категория с именем "{{title}}" и подкатегории "{{sbcTitles}}" восстановлены из заархивированных',
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED_WITH_NT)]:
      'Категория "{{title}}" и записи "{{ntIds}}" восстановлены из заархивированных',
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED)]:
      'Категория "{{title}}" восстановлена из заархивированных',
    [TransformFunc(TrKey.INVALID_UNDO_DEL_SBC_CMD)]:
      '❗ Неправильная команда для отмены удаления подкатегории, пример:',
    [TransformFunc(TrKey.CMD_UNDO_SBC_DEL_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_UNDO_SBC_DEL_DESC)]:
      'отменить удаление подкатегории',
    [TransformFunc(TrKey.CMD_UNDO_SBC_DEL_PARAM)]: `
sbc_id (integer) - id подкатегории
sbc_t (string) - имя подкатегории
sbcName (string) - имя подкатегории`,
    [TransformFunc(TrKey.SBC_UNDO_DELETED_WITH_NT)]:
      'Подкатегория "{{title}}" и записи "{{ntIds}}" восстановлены из удаленных',
    [TransformFunc(TrKey.SBC_UNDO_DELETED)]:
      'Подкатегория "{{title}}" восстановлена из удаленных',
    [TransformFunc(TrKey.INVALID_ARCH_SBC_CMD)]:
      '❗ Неправильная команда для заархивирования подкатегории, пример:',
    [TransformFunc(TrKey.CMD_SBC_ARCH_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_SBC_ARCH_DESC)]: 'заархивировать подкатегорию',
    [TransformFunc(TrKey.CMD_SBC_ARCH_PARAM)]: `
sbc_id (integer) - id подкатегории
sbc_t (string) - имя подкатегории
sbcName (string) - имя подкатегории`,
    [TransformFunc(TrKey.SBC_ARCHIVED_WITH_NT)]:
      'Подкатегория "{{title}}" и записи "{{ntIds}}" заархивированны',
    [TransformFunc(TrKey.SBC_ARCHIVED)]:
      'Подкатегория "{{title}}" заархивированна',
    [TransformFunc(TrKey.INVALID_UNDO_ARCH_SBC_CMD)]:
      '❗ Неправильная команда для отмены заархивирования подкатегории, пример:',
    [TransformFunc(TrKey.CMD_UNDO_SBC_ARCH_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_UNDO_SBC_ARCH_DESC)]:
      'отменить заархивирование подкатегории',
    [TransformFunc(TrKey.CMD_UNDO_SBC_ARCH_PARAM)]: `
sbc_id (integer) - id подкатегории
sbc_t (string) - имя подкатегории
sbcName (string) - имя подкатегории`,
    [TransformFunc(TrKey.SBC_UNDO_ARCHIVED_WITH_NT)]:
      'Подкатегория "{{title}}" и записи "{{ntIds}}" восстановлены из заархивированных',
    [TransformFunc(TrKey.SBC_UNDO_ARCHIVED)]:
      'Подкатегория "{{title}}" восстановлена из заархивированных',
    [TransformFunc(TrKey.LIST_HEADER_SHOW_ARCH)]: `(в заархивированных)`,
    [TransformFunc(
      TrKey.INVALID_UNDO_DEL_NOTE_CMD,
    )]: `❗ Неправильная команда для отмены удаления записи, пример:`,
    [TransformFunc(TrKey.CMD_NT_UNDO_DEL_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_UNDO_DEL_DESC)]: 'отменить удаление записи',
    [TransformFunc(TrKey.CMD_NT_UNDO_DEL_PARAM)]: `
nt_id (integer) - id записи
ntId (integer) - id записи`,
    [TransformFunc(TrKey.NOTE_NUMBER_UNDO_DELETED)]:
      'Запись с 🆔 "{{id}}" и числом "{{number}}" и текстом "{{text}}" восстановлена из удаленных',
    [TransformFunc(TrKey.NOTE_TEXT_UNDO_DELETED)]:
      'Запись с 🆔 "{{id}}" и текстом "{{text}}" восстановлена из удаленных',
    [TransformFunc(
      TrKey.INVALID_ARCH_NOTE_CMD,
    )]: `❗ Неправильная команда для заархивирования записи, пример:`,
    [TransformFunc(TrKey.CMD_NT_ARCH_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_ARCH_DESC)]: 'заархивировать запись',
    [TransformFunc(TrKey.CMD_NT_ARCH_PARAM)]: `
nt_id (integer) - id записи
ntId (integer) - id записи`,
    [TransformFunc(TrKey.NOTE_NUMBER_ARCHIVED)]:
      'Запись с 🆔 "{{id}}" и числом "{{number}}" и текстом "{{text}}" заархивированна',
    [TransformFunc(TrKey.NOTE_TEXT_ARCHIVED)]:
      'Запись с 🆔 "{{id}}" и текстом "{{text}}" заархивированна',
    [TransformFunc(
      TrKey.INVALID_UNDO_ARCH_NOTE_CMD,
    )]: `❗ Неправильная команда для отмены заархивирования записи, пример:`,
    [TransformFunc(TrKey.CMD_NT_UNDO_ARCH_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_UNDO_ARCH_DESC)]:
      'отменить заархивирование записи',
    [TransformFunc(TrKey.CMD_NT_UNDO_ARCH_PARAM)]: `
nt_id (integer) - id записи
ntId (integer) - id записи`,
    [TransformFunc(TrKey.NOTE_NUMBER_UNDO_ARCHIVED)]:
      'Запись с 🆔 "{{id}}" и числом "{{number}}" и текстом "{{text}}" восстановлена из заархивированных',
    [TransformFunc(TrKey.NOTE_TEXT_UNDO_ARCHIVED)]:
      'Запись с 🆔 "{{id}}" и текстом "{{text}}" восстановлена из заархивированных',
  };
}

export default generate(TrStrKey);
