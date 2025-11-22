/**
 * プロフィール編集フォームのバリデーションユーティリティ
 */

export interface ValidationError {
  field: 'nickname' | 'birthday' | 'phoneNumber';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 名前（名）のバリデーション
 */
export function validateFirstName(value: string): string | null {
  if (!value || value.trim() === '') {
    return '名前（名）を入力してください';
  }
  if (value.trim().length > 50) {
    return '名前（名）は50文字以内で入力してください';
  }
  return null;
}

/**
 * 名前（姓）のバリデーション
 */
export function validateLastName(value: string): string | null {
  if (!value || value.trim() === '') {
    return '名前（姓）を入力してください';
  }
  if (value.trim().length > 50) {
    return '名前（姓）は50文字以内で入力してください';
  }
  return null;
}

/**
 * 生年月日のバリデーション
 */
export function validateBirthday(value: string | null): string | null {
  // 空の場合はOK
  if (!value || value.trim() === '') {
    return null;
  }

  // 形式チェック (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return '生年月日はYYYY-MM-DD形式で入力してください';
  }

  // 日付の妥当性チェック
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return '有効な生年月日を入力してください';
  }

  // 未来の日付チェック
  if (date > new Date()) {
    return '生年月日は現在より前の日付を入力してください';
  }

  // 1900年以前の日付チェック
  const minDate = new Date('1900-01-01');
  if (date < minDate) {
    return '生年月日は1900年以降の日付を入力してください';
  }

  return null;
}

/**
 * ニックネームのバリデーション
 */
export function validateNickname(value: string | null): string | null {
  // 空の場合はOK
  if (!value || value.trim() === '') {
    return null;
  }

  // 長さチェック
  if (value.trim().length > 20) {
    return 'ニックネームは20文字以内で入力してください';
  }

  return null;
}

/**
 * 電話番号のバリデーション
 */
export function validatePhoneNumber(value: string | null): string | null {
  // 空の場合はOK
  if (!value || value.trim() === '') {
    return null;
  }

  // 形式チェック（数字とハイフンのみ）
  const phoneRegex = /^[\d-]+$/;
  if (!phoneRegex.test(value)) {
    return '電話番号は数字とハイフンのみで入力してください';
  }

  // 長さチェック（ハイフンを除いた桁数が10-11桁）
  const digitsOnly = value.replace(/-/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 11) {
    return '電話番号は10桁または11桁で入力してください';
  }

  return null;
}

/**
 * プロフィール更新リクエストの全体バリデーション
 */
export function validateProfileUpdate(data: {
  nickname?: string | null;
  birthday: string | null;
  phoneNumber: string | null;
}): ValidationResult {
  const errors: ValidationError[] = [];

  const nicknameError = validateNickname(data.nickname || null);
  if (nicknameError) {
    errors.push({ field: 'nickname', message: nicknameError });
  }

  const birthdayError = validateBirthday(data.birthday);
  if (birthdayError) {
    errors.push({ field: 'birthday', message: birthdayError });
  }

  const phoneNumberError = validatePhoneNumber(data.phoneNumber);
  if (phoneNumberError) {
    errors.push({ field: 'phoneNumber', message: phoneNumberError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
