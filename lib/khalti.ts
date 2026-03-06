// Khalti payment integration utility
// You will need to install the Khalti JS SDK via npm or include their script in your public/index.html
// This utility assumes you have a Khalti public key

export const KHALTI_PUBLIC_KEY = 'test_public_key_xxxxxxxx'; // Replace with your real Khalti public key

interface KhaltiConfigParams {
  productIdentity: string;
  productName: string;
  amount: number;
  onSuccess: (data: any) => void;
  onError: (data: any) => void;
}

export function getKhaltiConfig({productIdentity, productName, amount, onSuccess, onError}: KhaltiConfigParams) {
  return {
    publicKey: KHALTI_PUBLIC_KEY,
    productIdentity,
    productName,
    productUrl: window.location.href,
    eventHandler: {
      onSuccess,
      onError,
      onClose: () => {},
    },
    paymentPreference: [
      'KHALTI',
      'EBANKING',
      'MOBILE_BANKING',
      'CONNECT_IPS',
      'SCT',
    ],
  };
}
