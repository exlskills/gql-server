export const courseCache = { updated_at: new Date('1970-01-01Z00:00:00:000') };
export const courseDeliveryCache = {
  updated_at: new Date('1970-01-01Z00:00:00:000')
};
export const listDefCache = { updated_at: new Date('1970-01-01Z00:00:00:000') };

/*
 *    course_id
 *      units = map (unit_id, content) sorted by index
 *        sections = map (section_id, content) sorted by index
 *           cards = map (card_id, content) sorted by index
 */
export const courseStructureCache = {
  updated_at: new Date('1970-01-01Z00:00:00:000')
};

/*
 *  question_id, content
 *      data = map (data elem id for MC or 1 for WSCQ, content) sorted by s  eq (applies to MC):
 *
 */
export const questionCache = {
  updated_at: new Date('1970-01-01Z00:00:00:000')
};

// Key by Card ID
export const cardContentCache = {
  updated_at: new Date('1970-01-01Z00:00:00:000')
};
