import { Buffer } from 'buffer';
export function base64decoder(Context): any {
  const decoder = new Buffer(Context, 'base64').toString();
  return decoder;
}

export function base64encoder(Context): any {
  const encoder = new Buffer(Context).toString('base64');
  return encoder;
}
