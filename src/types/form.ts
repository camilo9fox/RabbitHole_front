export interface FormField {
  [key: string]: string | number | boolean;
}

export type FormData = Record<string, string | number | boolean>;

export interface FormFieldTypes {
  [key: string]: string | number | boolean;
}
