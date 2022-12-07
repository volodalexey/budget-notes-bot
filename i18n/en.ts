import { TrKey, TrStrKey } from './keys';

export function generate(TransformFunc: (key: TrKey) => string): {
  [index: string]: string;
} {
  return {
    [TransformFunc(TrKey.TEXT)]: '{{text}}',
    [TransformFunc(TrKey.UNKONWN_USER)]: '❗ Unknown user',
    [TransformFunc(TrKey.USER_GONE)]:
      '❗ User "{{first_name}}" gone during operation',
    [TransformFunc(
      TrKey.INVALID_SET_LANG_CMD,
    )]: `Current language "{{languageCode}}"
❗ Invalid set language command, example:`,
    [TransformFunc(TrKey.INVALID_LANGUAGE)]:
      '❗ Language type must be one of "{{languages}}" but not "{{language}}"',
    [TransformFunc(TrKey.LANGUAGE_UPDATED)]:
      'Language "{{oldLanguage}}" updated to "{{newLanguage}}"',
    [TransformFunc(
      TrKey.YOU_ARE_ALLOWED_TO_USE,
    )]: `🎉 You are registered and you can use this bot!
See all commands /help
Set time zone /settimezone
Set week start day /setweekstartson`,
    [TransformFunc(TrKey.INVALID_ADD_CTG_CMD)]:
      '❗ Invalid add category command, example:',
    [TransformFunc(TrKey.INVALID_UPDN_CTG_CMD)]:
      '❗ Invalid update category name command, example:',
    [TransformFunc(TrKey.INVALID_UPDD_CTG_CMD)]:
      '❗ Invalid update category description command, example:',
    [TransformFunc(TrKey.INVALID_DEL_CTG_CMD)]:
      '❗ Invalid delete category command, example:',
    [TransformFunc(TrKey.CATEGORY_EXISTS)]:
      '❗ Category "{{title}}" already exists',
    [TransformFunc(TrKey.TITLE_EXISTS_IN_SUBCTG)]:
      '❗ Title "{{title}}" exists as subcategory title',
    [TransformFunc(TrKey.RES_CTG_ADDED)]: `Category added
Created fields:
{{createdFields}}`,
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_ID)]: '🆔 "{{ctgId}}"',
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_TYPE)]: 'Type "{{ctgType}}"',
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_TITLE)]: 'Name "{{ctgTitle}}"',
    [TransformFunc(TrKey.RES_CTG_ADDED_FIELD_DESCR)]:
      'Description "{{ctgDescr}}"',
    [TransformFunc(
      TrKey.CTG_TITLE_MAX_ERROR,
    )]: `❗ Category name must not exceed "{{max}}" characters`,
    [TransformFunc(
      TrKey.CTG_DESC_MAX_ERROR,
    )]: `❗ Category description must not exceed "{{max}}" characters (include spaces)`,
    [TransformFunc(TrKey.YOUR_CATEGORIES)]: `Your categories:
{{text}}`,
    [TransformFunc(TrKey.NO_CATEGORIES)]: 'No categories',
    [TransformFunc(TrKey.CTG_NOT_EXISTS_BY_ID)]:
      '❗ Category with 🆔 "{{id}}" does not exist',
    [TransformFunc(TrKey.CTG_NOT_EXISTS_BY_TITLE)]:
      '❗ Category "{{title}}" does not exist',
    [TransformFunc(TrKey.CATEGORY_NAME_UPDATED)]:
      'Category "{{oldTitle}}" updated to "{{newTitle}}"',
    [TransformFunc(TrKey.CATEGORY_DESC_UPDATED)]:
      'Category "{{ctgTitle}}" with description "{{oldDesc}}" updated to new description "{{newDesc}}"',
    [TransformFunc(TrKey.CTG_DELETED)]: 'Category "{{title}}" deleted',
    [TransformFunc(TrKey.CTG_DELETED_WITH_SBC)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" deleted',
    [TransformFunc(TrKey.CTG_DELETED_WITH_SBC_AND_NT)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" and notes "{{ntIds}}" deleted',
    [TransformFunc(TrKey.CTG_DELETED_WITH_NT)]:
      'Category "{{title}}" and tracked notes "{{ntIds}}" deleted',
    [TransformFunc(TrKey.CATEGORY_GONE)]:
      '❗ Category "{{title}}" gone during operation',
    [TransformFunc(TrKey.YOUR_NOTES)]: `Your notes:
{{text}}`,
    [TransformFunc(TrKey.NO_NOTES)]: 'No notes',
    [TransformFunc(TrKey.ERROR_PRONE_STRING)]:
      '❗ Words must not start with "{{invTitles}}"',
    [TransformFunc(
      TrKey.INVALID_ADD_SBC_CMD,
    )]: `❗ Invalid add subcategory command, example:`,
    [TransformFunc(
      TrKey.INVALID_UPDN_SBC_CMD,
    )]: `❗ Invalid update subcategory name command, example:`,
    [TransformFunc(
      TrKey.INVALID_UPDD_SBC_CMD,
    )]: `❗ Invalid update subcategory description command, example:`,
    [TransformFunc(
      TrKey.INVALID_DEL_SBC_CMD,
    )]: `❗ Invalid delete subcategory command, example:`,
    [TransformFunc(
      TrKey.SBC_TITLE_MAX_ERROR,
    )]: `❗ Subcategory name must not exceed "{{max}}" characters`,
    [TransformFunc(
      TrKey.SBC_DESC_MAX_ERROR,
    )]: `❗ Subcategory description must not exceed "{{max}}" characters (include spaces)`,
    [TransformFunc(TrKey.SUBCTG_EXISTS)]:
      '❗ Subcategory "{{title}}" already exists',
    [TransformFunc(TrKey.RES_SBC_ADDED)]: `Subcategory added
Created fields:
{{createdFields}}`,
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_ID)]: '🆔 "{{sbcId}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_TITLE)]: 'Name "{{sbcTitle}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_DESCR)]:
      'Description "{{sbcDescr}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_CTG_TYPE)]:
      'Category type "{{ctgType}}"',
    [TransformFunc(TrKey.RES_SBC_ADDED_FIELD_CTG_TITLE)]:
      'Category name "{{ctgTitle}}"',
    [TransformFunc(TrKey.YOUR_SUBCATEGORIES)]: `Your subcategories:
{{text}}`,
    [TransformFunc(TrKey.NO_SUBCATEGORIES)]: 'No subcategories',
    [TransformFunc(TrKey.SBC_NOT_EXISTS_BY_ID)]:
      '❗ Subcategory 🆔 "{{id}}" does not exist',
    [TransformFunc(TrKey.SBC_NOT_EXISTS_BY_TITLE)]:
      '❗ Subcategory "{{title}}" does not exist',
    [TransformFunc(TrKey.TITLE_EXISTS_IN_CATEGORY)]:
      '❗ Title "{{title}}" exists as category title',
    [TransformFunc(TrKey.SUBCTG_NAME_UPDATED)]:
      'Subcategory "{{oldTitle}}" updated to "{{newTitle}}"',
    [TransformFunc(TrKey.SUBCTG_DESC_UPDATED)]:
      'Subcategory "{{sbcTitle}}" with description "{{oldDesc}}" updated to "{{newDesc}}"',
    [TransformFunc(TrKey.SBC_DELETED)]: 'Subcategory "{{title}}" deleted',
    [TransformFunc(TrKey.SBC_DELETED_WITH_NT)]:
      'Subcategory "{{title}}" and notes "{{ntIds}}" deleted',
    [TransformFunc(TrKey.SUBCTG_GONE)]:
      '❗ Subcategory "{{title}}" gone during operation',
    [TransformFunc(TrKey.NOTE_TEXT_EMPTY)]:
      '❗ Could not detect note text "{{text}}"',
    [TransformFunc(
      TrKey.NOTE_TEXT_MAX_ERROR,
    )]: `Note text must not exceed "{{max}}" characters (include spaces)
Current characters count "{{count}}"`,
    [TransformFunc(TrKey.NOTE_NUMBER_RANGE_ERROR)]:
      '❗ Note number must be upper than "{{min}}" and lower than "{{max}}"',
    [TransformFunc(TrKey.NOTE_NUMBER_FLOAT_ERROR)]:
      '❗ Note number "{{number}}" can contain only 3 decimal points',
    [TransformFunc(TrKey.RELATIVE_DAY_OF_MONTH_ERROR)]:
      '❗ Current month does not have provided day of month "{{relativeDay}}"',
    [TransformFunc(TrKey.RELATIVE_MONTH_OF_YEAR_ERROR)]:
      '❗ Current year does not have provided month of year "{{relativeMonth}}"',
    [TransformFunc(TrKey.RELATIVE_YEAR_ERROR)]:
      '❗ Provided year error "{{relativeYear}}"',
    [TransformFunc(TrKey.CATEGORY_OR_SUBCTG_NOT_EXIST)]:
      '❗ Category "{{title}}" or subcategory "{{title}}" not exist',
    [TransformFunc(TrKey.PARAM_TYPE_INT_POS_ERROR)]:
      '❗ Could not parse whole number parameter {{parName}} with value {{value}}',
    [TransformFunc(TrKey.PARAM_TYPE_BOOL_ERROR)]:
      '❗ Could not parse boolean parameter {{parName}} with value {{value}}',
    [TransformFunc(TrKey.PARAM_TYPE_STR_ERROR)]:
      '❗ Could not parse value "{{parValue}}" of parameter {{parName}}',
    [TransformFunc(TrKey.PARAM_TYPE_STR_MATCH_ERROR)]:
      '❗ Value of parameter {{parName}} should be on of {{parValues}}',
    [TransformFunc(TrKey.PARAM_TYPE_DATE_ERROR)]:
      '❗ Could not parse date "{{parValue}}" of parameter {{parName}}',
    [TransformFunc(TrKey.PARAM_TYPE_TIME_ERROR)]:
      '❗ Could not parse time "{{parValue}}" of parameter {{parName}}',
    [TransformFunc(TrKey.PARAM_TYPE_DATETIME_ERROR)]:
      '❗ Could not parse datetime "{{parValue}}" of parameter {{parName}}',
    [TransformFunc(TrKey.PARAM_CONFLICT_ERROR)]:
      '❗ Parameter "{{parName}}" is conflicted with {{conflictParName}}',
    [TransformFunc(TrKey.PARAM_CONFLICT_BIGGER_ERROR)]:
      '❗ Parameter "{{parName}}" is bigger than or equal {{conflictParName}}',
    [TransformFunc(TrKey.PARAM_CONFLICT_LESS_ERROR)]:
      '❗ Parameter "{{parName}}" is less than  or equal {{conflictParName}}',
    [TransformFunc(TrKey.NOTE_NOT_EXISTS)]:
      '❗ Note with 🆔 "{{id}}" does not exist',
    [TransformFunc(TrKey.NOTE_NUMBER_DELETED)]:
      'Note with 🆔 "{{id}}" and number "{{number}}" and text "{{text}}" deleted',
    [TransformFunc(TrKey.NOTE_TEXT_DELETED)]:
      'Note with 🆔 "{{id}}" and text "{{text}}" deleted',
    [TransformFunc(
      TrKey.INVALID_DEL_NOTE_CMD,
    )]: `❗ Invalid delete note command, example:`,
    [TransformFunc(
      TrKey.NOTE_FUTURE_DATE_WARNING,
    )]: `⚠ Warning, note has future date!\n`,
    [TransformFunc(TrKey.NOTE_ADDED)]: `{{futureDateMsg}}Note added
Created fields:
{{createdFields}}`,
    [TransformFunc(TrKey.NOTE_FIELD_ID_ADDED)]: '🆔 "{{noteId}}"',
    [TransformFunc(TrKey.NOTE_FIELD_DATETIME_ADDED)]:
      'Datetime "{{noteDatetime}}"',
    [TransformFunc(TrKey.NOTE_FIELD_NUMBER_ADDED)]: 'Number "{{noteNumber}}"',
    [TransformFunc(TrKey.NOTE_FIELD_TEXT_ADDED)]: 'Text "{{noteText}}"',
    [TransformFunc(TrKey.NOTE_FIELD_CATEGORY_ADDED)]:
      'Category "{{noteCategoryTitle}}"',
    [TransformFunc(TrKey.NOTE_FIELD_SUBCATEGORY_ADDED)]:
      'Subcategory "{{noteSubcategoryTitle}}"',
    [TransformFunc(
      TrKey.NOTE_UPDATED,
    )]: `{{futureDateMsg}}Note with 🆔 "{{id}}" updated
Updated fields:
{{updatedFields}}`,
    [TransformFunc(TrKey.NOTE_FIELD_DATETIME_UPDATED)]:
      'Datetime "{{oldValue}}" ➡️ "{{newValue}}"',
    [TransformFunc(TrKey.NOTE_FIELD_NUMBER_UPDATED)]:
      'Number "{{oldValue}}" ➡️ "{{newValue}}"',
    [TransformFunc(TrKey.NOTE_FIELD_TEXT_UPDATED)]:
      'Text "{{oldValue}}" ➡️ "{{newValue}}"',
    [TransformFunc(TrKey.NOTE_GONE)]: '❗ Note "{{id}}" gone during operation',
    [TransformFunc(TrKey.INVALID_HELP_CMD)]:
      '❗ Invalid help command, example:',
    [TransformFunc(TrKey.CMD_HELP_DESC)]: 'print all bot commands',
    [TransformFunc(TrKey.CMD_HELP_EXAM)]: '{{cmd}} [bf=bool] [cmdName]',
    [TransformFunc(TrKey.CMD_HELP_PARAM)]: `
bf (boolean) - adjust print for bot father
cmdName (string) - print help for specified command`,
    [TransformFunc(TrKey.CMD_CTG_ADD_EXAM)]:
      '{{cmd}} [ctg_type=type] [ctg_t=str] [ctg_d=str] [ctgName] [ctgDescription]',
    [TransformFunc(TrKey.CMD_CTG_ADD_DESC)]: 'add new category',
    [TransformFunc(TrKey.CMD_CTG_ADD_PARAM)]: `
ctg_type ({{types}}) - category type
ctg_t (string) - category name
ctg_d (string) - category description
ctgName (string) - category name
ctgDescription (string) - category description`,
    [TransformFunc(TrKey.CMD_CTG_LIST_EXAM)]:
      '{{cmd}} [l=int] [s=int] [show_id=bool] [show_del=bool] [show_arch=bool] [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [ctg_qid_gt=int] [ctg_qid_gte=int] [ctg_qid_lt=int] [ctg_qid_lte=int] [sbc_qid_gt=int] [sbc_qid_gte=int] [sbc_qid_lt=int] [sbc_qid_lte=int] [queryText]',
    [TransformFunc(TrKey.CMD_CTG_LIST_DESC)]: 'list last 30 categories',
    [TransformFunc(TrKey.CMD_CTG_LIST_PARAM)]: `
l (integer) - limit categories
s (integer) - skip categories
show_id (boolean) - show categories id
show_del (boolean) - show deleted categories
show_arch (boolean) - show archived categories
q (string) - filter categories by category/subcategory name/description or note text
ctg_q (string) - filter categories by category name/description
sbc_q (string) - filter categories by subcategory name/description
ctg_qt (string) - filter categories by category name
sbc_qt (string) - filter categories by subcategory name
ctg_qd (string) - filter categories by category description
sbc_qd (string) - filter categories by subcategory description
ctg_qid_gt (integer) - filter categories by category id greater than
ctg_qid_gte (integer) - filter categories by category id greater than or equal
ctg_qid_lt (integer) - filter categories by category id less than
ctg_qid_lte (integer) - filter categories by category id less than or equal
sbc_qid_gt (integer) - filter categories by subcategory id greater than
sbc_qid_gte (integer) - filter categories by subcategory id greater than or equal
sbc_qid_lt (integer) - filter categories by subcategory id less than
sbc_qid_lte (integer) - filter categories by subcategory id less than or equal
queryText (string) - filter categories by category/subcategory name/description or note text`,
    [TransformFunc(TrKey.CMD_CTG_UPDN_EXAM)]: '{{cmd}} [oldName] [newName]',
    [TransformFunc(TrKey.CMD_CTG_UPDN_DESC)]: 'update category name',
    [TransformFunc(TrKey.CMD_CTG_UPDN_PARAM)]: `
(oldName - old category name,
newName - new category name)`,
    [TransformFunc(TrKey.CMD_CTG_UPDD_EXAM)]: '{{cmd}} [ctgName] [newDescr]',
    [TransformFunc(TrKey.CMD_CTG_UPDD_DESC)]: 'update category description',
    [TransformFunc(TrKey.CMD_CTG_UPDD_PARAM)]: `
(ctgName - category name,
newDescr - new category description)`,
    [TransformFunc(TrKey.CMD_CTG_DEL_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_CTG_DEL_DESC)]: 'delete category',
    [TransformFunc(TrKey.CMD_CTG_DEL_PARAM)]: `
ctg_id (integer) - category id
ctg_t (string) - category name
ctgName (string) - category name`,
    [TransformFunc(TrKey.CMD_SBC_ADD_EXAM)]:
      '{{cmd}} [ctg_t=str] [sbc_t=str] [sbc_d=str] [sbcName] [sbcDescription]',
    [TransformFunc(TrKey.CMD_SBC_ADD_DESC)]: 'add new subcategory to category',
    [TransformFunc(TrKey.CMD_SBC_ADD_PARAM)]: `
ctg_t (string) - category name
sbc_t (string) - subcategory name
sbc_d (string) - subcategory description
sbcName (string) - subcategory name
sbcDescription (string) - subcategory description`,
    [TransformFunc(TrKey.CMD_SBC_LIST_EXAM)]:
      '{{cmd}} [l=int] [s=int] [show_id=bool] [show_del=bool] [show_arch=bool] [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [ctg_qid_gt=int] [ctg_qid_gte=int] [ctg_qid_lt=int] [ctg_qid_lte=int] [sbc_qid_gt=int] [sbc_qid_gte=int] [sbc_qid_lt=int] [sbc_qid_lte=int] [queryText]',
    [TransformFunc(TrKey.CMD_SBC_LIST_DESC)]: 'list last 30 subcategories',
    [TransformFunc(TrKey.CMD_SBC_LIST_PARAM)]: `
l (integer) - limit subcategories
s (integer) - skip subcategories
show_id (boolean) - show subcategories id
show_del (boolean) - show deleted subcategories
show_arch (boolean) - show archived subcategories
q (string) - filter subcategories by category/subcategory name/description or note text
ctg_q (string) - filter subcategories by category name/description
sbc_q (string) - filter subcategories by subcategory name/description
ctg_qt (string) - filter subcategories by category name
sbc_qt (string) - filter subcategories by subcategory name
ctg_qd (string) - filter subcategories by category description
sbc_qd (string) - filter subcategories by subcategory description
ctg_qid_gt (integer) - filter subcategories by category id greater than
ctg_qid_gte (integer) - filter subcategories by category id greater than or equal
ctg_qid_lt (integer) - filter subcategories by category id less than
ctg_qid_lte (integer) - filter subcategories by category id less than or equal
sbc_qid_gt (integer) - filter subcategories by subcategory id greater than
sbc_qid_gte (integer) - filter subcategories by subcategory id greater than or equal
sbc_qid_lt (integer) - filter subcategories by subcategory id less than
sbc_qid_lte (integer) - filter subcategories by subcategory id less than or equal
queryText (string) - filter subcategories by category/subcategory name/description or note text`,
    [TransformFunc(TrKey.CMD_SBC_UPDN_EXAM)]: '{{cmd}} [oldName] [newName]',
    [TransformFunc(TrKey.CMD_SBC_UPDN_DESC)]: 'update subcategory name',
    [TransformFunc(TrKey.CMD_SBC_UPDN_PARAM)]: `
(oldName - old subcategory name,
newName - new subcategory name)`,
    [TransformFunc(TrKey.CMD_SBC_UPDD_EXAM)]:
      '{{cmd}} [sbcName] [newDescription]',
    [TransformFunc(TrKey.CMD_SBC_UPDD_DESC)]: 'update subcategory description',
    [TransformFunc(TrKey.CMD_SBC_UPDD_PARAM)]: `
(sbcName - subcategory name,
newDescription - new subcategory description)`,
    [TransformFunc(TrKey.CMD_SBC_DEL_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_SBC_DEL_DESC)]: 'delete subcategory',
    [TransformFunc(TrKey.CMD_SBC_DEL_PARAM)]: `
sbc_id (integer) - subcategory id
sbc_t (string) - subcategory name
sbcName (string) - subcategory name`,
    [TransformFunc(TrKey.INVALID_ADD_NT_CMD)]:
      '❗ Invalid add note command, example:',
    [TransformFunc(TrKey.CMD_NT_ADD_EXAM)]:
      '{{cmd}} [d=date] [t=time] [dt=datetime] [rd=int] [nt_n=float] [nt_t=str] [ctg_id=int] [ctg_t=str] [sbc_id=int] [sbc_t=str]',
    [TransformFunc(TrKey.CMD_NT_ADD_DESC)]: 'add new note',
    [TransformFunc(TrKey.CMD_NT_ADD_PARAM)]: `
d (date) - note date
t (time) - note time
dt (datetime) - note date and time
rd (integer) - note day of the month (+1 for next day, -1 for previous day, 2 - for 2nd day of current month)
nt_n (float) - note number
nt_t (string) - note text
ctg_id (integer) - category id
ctg_t (string) - category name
sbc_id (integer) - subcategory id
sbc_t (string) - subcategory name`,
    [TransformFunc(TrKey.CMD_NT_LIST_EXAM)]:
      '{{cmd}} [l=int] [s=int] [d=date] [s_d=date] [e_d=date] [show_id=bool] [show_del=bool] [show_arch=bool] [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [nt_qt=str] [nt_qn=float] [nt_qn_gt=int] [nt_qn_gte=int] [nt_qn_lt=int] [nt_qn_lte=int] [nt_qid_gt=int] [nt_qid_gte=int] [nt_qid_lt=int] [nt_qid_lte=int] [ctg_qid_gt=int] [ctg_qid_gte=int] [ctg_qid_lt=int] [ctg_qid_lte=int] [sbc_qid_gt=int] [sbc_qid_gte=int] [sbc_qid_lt=int] [sbc_qid_lte=int] [rd=int] [rm=int] [ry=int] [queryText]',
    [TransformFunc(TrKey.CMD_NT_LIST_DESC)]: 'list last 10 notes',
    [TransformFunc(TrKey.CMD_NT_LIST_PARAM)]: `
l (integer) - limit notes
s (integer) - skip notes
d (date) - filter notes by note date
s_d (date) - filter notes by note start date
e_d (date) - filter notes by note end date
show_id (boolean) - show notes id
show_del (boolean) - show deleted notes
show_arch (boolean) - show archived notes
q (string) - filter notes by category/subcategory name/description or note text
ctg_q (string) - filter notes by category name/description
sbc_q (string) - filter notes by subcategory name/description
ctg_qt (string) - filter notes by category name
sbc_qt (string) - filter notes by subcategory name
ctg_qd (string) - filter notes by category description
sbc_qd (string) - filter notes by subcategory description
nt_qt (string) - filter notes by note text
nt_qn (float) - filter notes by note number
nt_qn_gt (integer) - filter notes by note number greater than
nt_qn_gte (integer) - filter notes by note number greater than or equal
nt_qn_lt (integer) - filter notes by note number less than
nt_qn_lte (integer) - filter notes by note number less than or equal
nt_qid_gt (integer) - filter notes by note id greater than
nt_qid_gte (integer) - filter notes by note id greater than or equal
nt_qid_lt (integer) - filter notes by note id less than
nt_qid_lte (integer) - filter notes by note id less than or equal
ctg_qid_gt (integer) - filter notes by category id greater than
ctg_qid_gte (integer) - filter notes by category id greater than or equal
ctg_qid_lt (integer) - filter notes by category id less than
ctg_qid_lte (integer) - filter notes by category id less than or equal
sbc_qid_gt (integer) - filter notes by subcategory id greater than
sbc_qid_gte (integer) - filter notes by subcategory id greater than or equal
sbc_qid_lt (integer) - filter notes by subcategory id less than
sbc_qid_lte (integer) - filter notes by subcategory id less than or equal
rd (integer) - day of the month (+1 for next day, -1 for previous day, 2 - for 2nd day of current month)
rm (integer) - month of the year (+1 for next month, -1 for previous month, 2 - for 2nd month of current year)
ry (integer) - year (+1 for next year, -1 for previous year, 1023 - for specified year)
queryText (string) - filter notes by category/subcategory name/description or note text`,
    [TransformFunc(TrKey.CMD_UPDNT_EXAM)]:
      '{{cmd}} [nt_id=int] [d=date] [t=time] [dt=datetime] [rd=int] [nt_n=float] [nt_t=str]',
    [TransformFunc(TrKey.CMD_UPDNT_DESC)]: 'update note',
    [TransformFunc(TrKey.CMD_UPDNT_PARAM)]: `
nt_id (integer) - note id
d (date) - note date
t (time) - note time
dt (datetime) - note date and time
rd (integer) - note day of the month (+1 for next day, -1 for previous day, 2 - for 2nd day of current month)
nt_n (float) - note number
nt_t (string) - note text`,
    [TransformFunc(TrKey.CMD_NT_DEL_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_DEL_DESC)]: 'delete note',
    [TransformFunc(TrKey.CMD_NT_DEL_PARAM)]: `
nt_id (integer) - note id
ntId (integer) - note id`,
    [TransformFunc(TrKey.CMD_SET_LANG_EXAM)]: '{{cmd}} [lang]',
    [TransformFunc(TrKey.CMD_SET_LANG_DESC)]: 'set bot messages language',
    [TransformFunc(TrKey.CMD_SET_LANG_PARAM)]: `
(lang - language code, one of [{{languages}})])`,
    [TransformFunc(TrKey.LIST_HEADER_LIMIT)]: `(limit "{{limitNum}}")`,
    [TransformFunc(TrKey.LIST_HEADER_SKIP)]: `(skip "{{skipNum}}")`,
    [TransformFunc(TrKey.LIST_HEADER_SHOW_ID)]: `(show id's)`,
    [TransformFunc(TrKey.LIST_HEADER_SHOW_DEL)]: `(in deleted)`,
    [TransformFunc(
      TrKey.LIST_HEADER_START_DT,
    )]: `(start date "{{startDateTime}}")`,
    [TransformFunc(TrKey.LIST_HEADER_END_DT)]: `(end date "{{endDateTime}}")`,
    [TransformFunc(TrKey.LIST_HEADER_QUERY)]: `(search query "{{query}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_QUERY,
    )]: `(search in categories "{{ctgQuery}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_QUERY_TITLE,
    )]: `(search in categories title "{{ctgQueryTitle}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_QUERY_DESCR,
    )]: `(search in categories description "{{ctgQueryDescr}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_QUERY,
    )]: `(search in subcategories "{{sbcQuery}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_QUERY_TITLE,
    )]: `(search in subcategories title "{{sbcQueryTitle}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_QUERY_DESCR,
    )]: `(search in subcategories description "{{sbcQueryDescr}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_QUERY_TEXT,
    )]: `(search in notes text "{{ntQueryText}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_QUERY_NUMBER,
    )]: `(search in notes number "{{ntQueryNumber}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_GREATER_THAN,
    )]: `(search in notes number which greater than "{{ntQueryNumberGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_GREATER_THAN_OR_EQUAL,
    )]: `(search in notes number which greater than or equal "{{ntQueryNumberGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_LESS_THAN,
    )]: `(search in notes number which less than "{{ntQueryNumberLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_NUMBER_LESS_THAN_OR_EQUAL,
    )]: `(search in notes number which less than or equal "{{ntQueryNumberLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_GREATER_THAN,
    )]: `(search in categories which id greater than "{{ctgQueryIdGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_GREATER_THAN_OR_EQUAL,
    )]: `(search in categories which id greater than or equal "{{ctgQueryIdGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_LESS_THAN,
    )]: `(search in categories which id less than "{{ctgQueryIdLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_ID_LESS_THAN_OR_EQUAL,
    )]: `(search in categories which id less than or equal "{{ctgQueryIdLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_GREATER_THAN,
    )]: `(search in subcategories which id greater than "{{sbcQueryIdGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_GREATER_THAN_OR_EQUAL,
    )]: `(search in subcategories which id greater than or equal "{{sbcQueryIdGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_LESS_THAN,
    )]: `(search in subcategories which id less than "{{sbcQueryIdLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_ID_LESS_THAN_OR_EQUAL,
    )]: `(search in subcategories which id less than or equal "{{sbcQueryIdLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_GREATER_THAN,
    )]: `(search in notes which id greater than "{{ntQueryIdGreaterThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_GREATER_THAN_OR_EQUAL,
    )]: `(search in notes which id greater than or equal "{{ntQueryIdGreaterThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_LESS_THAN,
    )]: `(search in notes which id less than "{{ntQueryIdLessThan}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_NT_ID_LESS_THAN_OR_EQUAL,
    )]: `(search in notes which id less than or equal "{{ntQueryIdLessThanOrEq}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_CTG_COUNT,
    )]: `(categories count "{{ctgCount}}")`,
    [TransformFunc(
      TrKey.LIST_HEADER_SBC_COUNT,
    )]: `(subcategories count "{{sbcCount}}")`,
    [TransformFunc(TrKey.LIST_HEADER_NT_COUNT)]: `(notes count "{{ntCount}}")`,
    [TransformFunc(TrKey.CALC_SUMMARY)]: `Summary: {{text}}`,
    [TransformFunc(TrKey.EMPTY_SUMMARY)]: `Empty summary`,
    [TransformFunc(
      TrKey.INVALID_SET_TIMEZONE_CMD,
    )]: `Current time zone "{{timeZone}}"
❗ Invalid set time zone command, example:`,
    [TransformFunc(
      TrKey.TIME_ZONE_MAX_ERROR,
    )]: `❗ Time zone name must not exceed "{{max}}" characters`,
    [TransformFunc(
      TrKey.TIME_ZONE_UPDATED,
    )]: `Time zone updated from "{{oldTimeZone}}" to "{{newTimeZone}}"`,
    [TransformFunc(
      TrKey.TIME_ZONE_FIND_ERROR,
    )]: `❗ Can not find time zone by text "{{text}}"`,
    [TransformFunc(
      TrKey.TIME_ZONE_AMB_ERROR,
    )]: `❗ Try refining your search, too many options:
{{timeZones}}`,
    [TransformFunc(TrKey.CMD_SET_TIMEZONE_EXAM)]: '{{cmd}} [timeZone]',
    [TransformFunc(TrKey.CMD_SET_TIMEZONE_DESC)]: 'set user time zone',
    [TransformFunc(TrKey.CMD_SET_TIMEZONE_PARAM)]: `
(timeZone - time zone, e.g. "{{timeZone}}")`,
    [TransformFunc(TrKey.CMD_SET_WEEKS_STARTS_ON_EXAM)]:
      '{{cmd}} [weekStartsOn]',
    [TransformFunc(TrKey.CMD_SET_WEEKS_STARTS_ON_DESC)]:
      'set user week start day',
    [TransformFunc(TrKey.CMD_SET_WEEKS_STARTS_ON_PARAM)]: `
(weekStartsOn - week start day, e.g. "0" - Sunday, "1" - Monday)`,
    [TransformFunc(
      TrKey.INVALID_SET_WEEK_STARTS_ON_CMD,
    )]: `Current week starts on "{{weekStartsOn}}"
❗ Invalid set week starts on command, example:`,
    [TransformFunc(
      TrKey.INVALID_WEEK_STARTS_ON,
    )]: `❗ Week starts on must be one of "0|1|2|3|4|5|6" but not "{{weekStartsOn}}"`,
    [TransformFunc(
      TrKey.WEEK_STARTS_ON_UPDATED,
    )]: `Week starts on "{{oldWeeksStartsOn}}" updated to "{{newWeeksStartsOn}}"`,
    [TransformFunc(
      TrKey.CALC_BALANCE,
    )]: `Balance till {{endDateTime}} is {{balance}}`,
    [TransformFunc(
      TrKey.PARAM_DUPLICATE_ERROR,
    )]: `❗ Duplicate command parameter {{parName}}`,
    [TransformFunc(
      TrKey.PARAM_AMBIGUOUS_ERROR,
    )]: `❗ Command parameter {{parName}} is ambiguous, because of provided text`,
    [TransformFunc(TrKey.INVALID_STATS_CMD)]:
      '❗ Invalid get statistic command, example:',
    [TransformFunc(TrKey.CMD_STATS_EXAM)]:
      '{{cmd}} [q=str] [ctg_q=str] [sbc_q=str] [ctg_qt=str] [sbc_qt=str] [ctg_qd=str] [sbc_qd=str] [nt_qt=str] [d=date] [s_d=date] [e_d=date] [rd=int] [rm=int] [ry=int] [queryText]',
    [TransformFunc(TrKey.CMD_STATS_DESC)]: 'get statistic',
    [TransformFunc(TrKey.CMD_STATS_PARAM)]: `
q (string) - filter statistic by category/subcategory name/description or note text
ctg_q (string) - filter statistic by category name/description
sbc_q (string) - filter statistic by subcategory name/description
ctg_qt (string) - filter statistic by category name
sbc_qt (string) - filter statistic by subcategory name
ctg_qd (string) - filter statistic by category description
sbc_qd (string) - filter statistic by subcategory description
nt_qt (string) - filter statistic by note text
d (date) - filter statistic by note date
s_d (date) - filter statistic by note start date
e_d (date) - filter statistic by note end date
rd (integer) - statistic day of the month (+1 for next day, -1 for previous day, 2 - for 2nd day of current month)
rm (integer) - statistic month of the year (+1 for next month, -1 for previous month, 2 - for 2nd month of current year)
ry (integer) - statistic year (+1 for next year, -1 for previous year, 1023 - for specified year)
queryText (string) - filter statistic by category/subcategory name/description or note text`,
    [TransformFunc(TrKey.SETTINGS)]: `Bot version "{{botVersion}}"
User id "{{userId}}"
Room id "{{peerId}}"
Quota "{{quota}}"
Current language "{{languageCode}}"
Current time zone "{{timeZone}}"
Current week starts on "{{weekStartsOn}}"`,
    [TransformFunc(TrKey.CMD_SETTINGS_EXAM)]: '{{cmd}}',
    [TransformFunc(TrKey.CMD_SETTINGS_DESC)]: 'get current settings',
    [TransformFunc(TrKey.CMD_SETTINGS_PARAM)]: ``,
    [TransformFunc(
      TrKey.INVALID_UPDNT_CMD,
    )]: `❗ Invalid update note command, example:`,
    [TransformFunc(
      TrKey.INVALID_APPNTT_CMD,
    )]: `❗ Invalid append note text command, example:`,
    [TransformFunc(TrKey.CMD_NT_APPT_EXAM)]:
      '{{cmd}} [ntId] [ntText] [nt_id=int] [nt_t=str]',
    [TransformFunc(TrKey.CMD_NT_APPT_DESC)]: 'append note text',
    [TransformFunc(TrKey.CMD_NT_APPT_PARAM)]: `
nt_id (integer) - note id
nt_t (string) - note text
ntId (integer) - note id
ntText (string) - note text`,
    [TransformFunc(
      TrKey.INVALID_TRNSNT_CMD,
    )]: `❗ Invalid transfer note command, example:`,
    [TransformFunc(TrKey.CMD_TRNSNT_EXAM)]: '{{cmd}} [id] [newCtgOrSbc]',
    [TransformFunc(TrKey.CMD_TRNSNT_DESC)]: '⚠ transfer note',
    [TransformFunc(TrKey.CMD_TRNSNT_PARAM)]: `
(id - note id
newCtgOrSbc - new note category or subcategory)`,
    [TransformFunc(
      TrKey.INVALID_TRNSNTS_CMD,
    )]: `❗ Invalid transfer notes command, example:`,
    [TransformFunc(TrKey.CMD_TRNSNTS_EXAM)]: '{{cmd}} [ctgOrSbc] [newCtgOrSbc]',
    [TransformFunc(TrKey.CMD_TRNSNTS_DESC)]: '⚠ transfer notes',
    [TransformFunc(TrKey.CMD_TRNSNTS_PARAM)]: `
(ctgOrSbc - existing notes category or subcategory
newCtgOrSbc - new notes category or subcategory)`,
    [TransformFunc(
      TrKey.CTG_TYPE_TRANSFER_ERROR,
    )]: `❗ You can not change notes category type from text to number or vice versa`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_CTG_TO_CTG,
    )]: `Notes "{{ntIds}}" transfered from category "{{fromTitle}}" to category "{{toTitle}}"`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_CTG_TO_SBC,
    )]: `Notes "{{ntIds}}" transfered from category "{{fromTitle}}" to subcategory "{{toTitle}}"`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_SBC_TO_CTG,
    )]: `Notes "{{ntIds}}" transfered from subcategory "{{fromTitle}}" to category "{{toTitle}}"`,
    [TransformFunc(
      TrKey.TRANSFERED_NOTES_FROM_SBC_TO_SBC,
    )]: `Notes "{{ntIds}}" transfered from subcategory "{{fromTitle}}" to subcategory "{{toTitle}}"`,
    [TransformFunc(
      TrKey.EQUAL_TRANSFER_CTG_OR_SBC,
    )]: `❗ Transfer from category "{{title}}" or subcategory "{{title}}" must not be equal transfer to category "{{title}}" or subcategory "{{title}}"`,
    [TransformFunc(
      TrKey.UNHANDLED_MESSAGE,
    )]: `❗ Command or message is not recognized
You can see all commands as /help`,
    [TransformFunc(TrKey.YOUR_USERS)]: `Your users:
{{text}}`,
    [TransformFunc(TrKey.NO_USERS)]: 'No users',
    [TransformFunc(TrKey.USER_QUOTA_REACHED)]: `⚠ Free quota limit reached`,
    [TransformFunc(TrKey.INVALID_UNDO_DEL_CTG_CMD)]:
      '❗ Invalid undo delete category command, example:',
    [TransformFunc(TrKey.CMD_UNDO_CTG_DEL_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_UNDO_CTG_DEL_DESC)]: 'undo delete category',
    [TransformFunc(TrKey.CMD_UNDO_CTG_DEL_PARAM)]: `
ctg_id (integer) - category id
ctg_t (string) - category name
ctgName (string) - category name`,
    [TransformFunc(TrKey.CTG_UNDO_DELETED_WITH_SBC_AND_NT)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" and notes "{{ntIds}}" restored from deleted',
    [TransformFunc(TrKey.CTG_UNDO_DELETED_WITH_SBC)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" restored from deleted',
    [TransformFunc(TrKey.CTG_UNDO_DELETED_WITH_NT)]:
      'Category "{{title}}" and tracked notes "{{ntIds}}" restored from deleted',
    [TransformFunc(TrKey.CTG_UNDO_DELETED)]:
      'Category "{{title}}" restored from deleted',
    [TransformFunc(TrKey.INVALID_ARCH_CTG_CMD)]:
      '❗ Invalid archive category command, example:',
    [TransformFunc(TrKey.CMD_CTG_ARCH_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_CTG_ARCH_DESC)]: 'archive category',
    [TransformFunc(TrKey.CMD_CTG_ARCH_PARAM)]: `
ctg_id (integer) - category id
ctg_t (string) - category name
ctgName (string) - category name`,
    [TransformFunc(TrKey.CTG_ARCHIVED_WITH_SBC_AND_NT)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" and notes "{{ntIds}}" archived',
    [TransformFunc(TrKey.CTG_ARCHIVED_WITH_SBC)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" archived',
    [TransformFunc(TrKey.CTG_ARCHIVED_WITH_NT)]:
      'Category "{{title}}" and tracked notes "{{ntIds}}" archived',
    [TransformFunc(TrKey.CTG_ARCHIVED)]: 'Category "{{title}}" archived',
    [TransformFunc(TrKey.INVALID_UNDO_ARCH_CTG_CMD)]:
      '❗ Invalid undo archive category command, example:',
    [TransformFunc(TrKey.CMD_UNDO_CTG_ARCH_EXAM)]:
      '{{cmd}} [ctg_id=int] [ctg_t=str] [ctgName]',
    [TransformFunc(TrKey.CMD_UNDO_CTG_ARCH_DESC)]: 'undo archive category',
    [TransformFunc(TrKey.CMD_UNDO_CTG_ARCH_PARAM)]: `
ctg_id (integer) - category id
ctg_t (string) - category name
ctgName (string) - category name`,
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED_WITH_SBC_AND_NT)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" and notes "{{ntIds}}" restored from archived',
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED_WITH_SBC)]:
      'Category "{{title}}" and connected subcategories "{{sbcTitles}}" restored from archived',
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED_WITH_NT)]:
      'Category "{{title}}" and tracked notes "{{ntIds}}" restored from archived',
    [TransformFunc(TrKey.CTG_UNDO_ARCHIVED)]:
      'Category "{{title}}" restored from archived',
    [TransformFunc(TrKey.INVALID_UNDO_DEL_SBC_CMD)]:
      '❗ Invalid undo delete subcategory command, example:',
    [TransformFunc(TrKey.CMD_UNDO_SBC_DEL_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_UNDO_SBC_DEL_DESC)]: 'undo delete subcategory',
    [TransformFunc(TrKey.CMD_UNDO_SBC_DEL_PARAM)]: `
sbc_id (integer) - subcategory id
sbc_t (string) - subcategory name
sbcName (string) - subcategory name`,
    [TransformFunc(TrKey.SBC_UNDO_DELETED_WITH_NT)]:
      'Subcategory "{{title}}" and tracked notes "{{ntIds}}" restored from deleted',
    [TransformFunc(TrKey.SBC_UNDO_DELETED)]:
      'Subcategory "{{title}}" restored from deleted',
    [TransformFunc(TrKey.INVALID_ARCH_SBC_CMD)]:
      '❗ Invalid archive subcategory command, example:',
    [TransformFunc(TrKey.CMD_SBC_ARCH_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_SBC_ARCH_DESC)]: 'archive subcategory',
    [TransformFunc(TrKey.CMD_SBC_ARCH_PARAM)]: `
sbc_id (integer) - subcategory id
sbc_t (string) - subcategory name
sbcName (string) - subcategory name`,
    [TransformFunc(TrKey.SBC_ARCHIVED_WITH_NT)]:
      'Subcategory "{{title}}" and tracked notes "{{ntIds}}" archived',
    [TransformFunc(TrKey.SBC_ARCHIVED)]: 'Subcategory "{{title}}" archived',
    [TransformFunc(TrKey.INVALID_UNDO_ARCH_SBC_CMD)]:
      '❗ Invalid undo archive subcategory command, example:',
    [TransformFunc(TrKey.CMD_UNDO_SBC_ARCH_EXAM)]:
      '{{cmd}} [sbc_id=int] [sbc_t=str] [sbcName]',
    [TransformFunc(TrKey.CMD_UNDO_SBC_ARCH_DESC)]: 'undo archive subcategory',
    [TransformFunc(TrKey.CMD_UNDO_SBC_ARCH_PARAM)]: `
sbc_id (integer) - subcategory id
sbc_t (string) - subcategory name
sbcName (string) - subcategory name`,
    [TransformFunc(TrKey.SBC_UNDO_ARCHIVED_WITH_NT)]:
      'Subcategory "{{title}}" and tracked notes "{{ntIds}}" restored from archived',
    [TransformFunc(TrKey.SBC_UNDO_ARCHIVED)]:
      'Subcategory "{{title}}" restored from archived',
    [TransformFunc(TrKey.LIST_HEADER_SHOW_ARCH)]: `(in archived)`,
    [TransformFunc(
      TrKey.INVALID_UNDO_DEL_NOTE_CMD,
    )]: `❗ Invalid undo delete note command, example:`,
    [TransformFunc(TrKey.CMD_NT_UNDO_DEL_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_UNDO_DEL_DESC)]: 'undo delete note',
    [TransformFunc(TrKey.CMD_NT_UNDO_DEL_PARAM)]: `
nt_id (integer) - note id
ntId (integer) - note id`,
    [TransformFunc(TrKey.NOTE_NUMBER_UNDO_DELETED)]:
      'Note with 🆔 "{{id}}" and number "{{number}}" and text "{{text}}" restored from deleted',
    [TransformFunc(TrKey.NOTE_TEXT_UNDO_DELETED)]:
      'Note with 🆔 "{{id}}" and text "{{text}}" restored from deleted',
    [TransformFunc(
      TrKey.INVALID_ARCH_NOTE_CMD,
    )]: `❗ Invalid archive note command, example:`,
    [TransformFunc(TrKey.CMD_NT_ARCH_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_ARCH_DESC)]: 'archive note',
    [TransformFunc(TrKey.CMD_NT_ARCH_PARAM)]: `
nt_id (integer) - note id
ntId (integer) - note id`,
    [TransformFunc(TrKey.NOTE_NUMBER_ARCHIVED)]:
      'Note with 🆔 "{{id}}" and number "{{number}}" and text "{{text}}" archived',
    [TransformFunc(TrKey.NOTE_TEXT_ARCHIVED)]:
      'Note with 🆔 "{{id}}" and text "{{text}}" archived',
    [TransformFunc(
      TrKey.INVALID_UNDO_ARCH_NOTE_CMD,
    )]: `❗ Invalid undo archive note command, example:`,
    [TransformFunc(TrKey.CMD_NT_UNDO_ARCH_EXAM)]: '{{cmd}} [nt_id=int] [ntId]',
    [TransformFunc(TrKey.CMD_NT_UNDO_ARCH_DESC)]: 'undo archive note',
    [TransformFunc(TrKey.CMD_NT_UNDO_ARCH_PARAM)]: `
nt_id (integer) - note id
ntId (integer) - note id`,
    [TransformFunc(TrKey.NOTE_NUMBER_UNDO_ARCHIVED)]:
      'Note with 🆔 "{{id}}" and number "{{number}}" and text "{{text}}" restored from archived',
    [TransformFunc(TrKey.NOTE_TEXT_UNDO_ARCHIVED)]:
      'Note with 🆔 "{{id}}" and text "{{text}}" restored from archived',
  };
}
// 🆔🤖😴💩❗🎉⚠
export default generate(TrStrKey);
