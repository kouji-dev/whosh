export function openPopupFlow(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const width = 600, height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popupWindow = window.open(
      url,
      'PopupFlow',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popupWindow) {
      reject(new Error('Popup blocked'));
      return;
    }
    resolve(popupWindow);
  });
} 