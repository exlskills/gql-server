const curses = [
  '6675636B',
  '73686974',
  '70697373',
  '63756E74',
  '74697473',
  '6E6967676572',
  '636F636B7375636B6572',
  '6D6F746865726675636B6572',
  '667261636B',
  '6672616B',
  '35683174',
  '35686974',
  '613535',
  '617373',
  '615f735f73',
  '6221746368',
  '6230306273',
  '62303062',
  '6231746368',
  '626f6e6572',
  '62756d',
  '636f636b',
  '6431636b',
  '6469636b',
  '666167',
  '676179',
  '736578',
  '686f726e79',
  '6d306630',
  '6d30666f',
  '6d6f666f',
  '6e31676761',
  '6e316767',
  '6e617a',
  '6e696767',
  '70656e6973',
  '70697373',
  '706f726e',
  '7368212b',
  '73682174',
  '73683174',
  '73686167',
  '73686974',
  '736c7574',
  '74697473',
  '766167696e61',
  '766961677261',
  '76756c7661',
  '77686f7265',
  '787878'
];

const hex2a = function(hexx) {
  const hex = hexx.toString(); //force conversion
  let str = '';
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
};

/* 
get the number of seconds into the current year 
*/
const get_second_into_year = function() {
  const d = new Date(new Date().getFullYear(), 0, 1);

  const currentDate = Math.round(new Date().getTime() / 1000);
  const startOfYear = Math.round(d.getTime() / 1000);
  return currentDate - startOfYear;
};

const cursed = function(code) {
  const low_code = code.toLowerCase();
  for (let j = 0; j < curses.length; j++) {
    const curse_word = hex2a(curses[j]).toLowerCase();
    if (low_code.indexOf(curse_word) !== -1) {
      return true;
    }
  }
  return false;
};

// helper function to get random bits of length nbits
const getRandBinaryBits = function(nbits) {
  let num_binary = '';
  for (let i = 0; i < nbits; i++) {
    num_binary =
      num_binary + '' + (Math.floor(Math.random() * 9) % 2).toString();
  }
  return num_binary;
};

// function to generate id
export const id_gen = function() {
  let code;
  do {
    const date_stamp = get_second_into_year();
    const first_25_bits = convertBase(date_stamp.toString(), 10, 62);
    let next_42_bits = convertBase(getRandBinaryBits(42), 2, 62);
    if (next_42_bits.length > 7) {
      next_42_bits = next_42_bits.substring(0, 7);
    }
    const final_bits_id = first_25_bits + next_42_bits;
    code = final_bits_id;
    if (code.length < 12) {
      code =
        first_25_bits +
        convertBase(Math.floor(Math.random() * 9).toString(), 10, 62) +
        next_42_bits;
    }
  } while (cursed(code));

  return code;
};

// helper function to convert from one particular base encoding to another
const convertBase = function(value, from_base, to_base) {
  const range = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(
    ''
  );
  const from_range = range.slice(0, from_base);
  const to_range = range.slice(0, to_base);

  let dec_value = value
    .split('')
    .reverse()
    .reduce(function(carry, digit, index) {
      if (from_range.indexOf(digit) === -1)
        throw new Error(
          'Invalid digit `' + digit + '` for base ' + from_base + '.'
        );
      return (carry += from_range.indexOf(digit) * Math.pow(from_base, index));
    }, 0);

  let new_value = '';
  while (dec_value > 0) {
    new_value = to_range[dec_value % to_base] + new_value;
    dec_value = (dec_value - (dec_value % to_base)) / to_base;
  }
  return new_value || '0';
};
