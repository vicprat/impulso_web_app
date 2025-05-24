'use client';

import { useState, useCallback } from 'react';

type Props = {
  successDuration?: number;
}

type CopyToClipboard = {
  copiedText: string | null;
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<boolean>;
}

export const useCopyToClipboard = ({
  successDuration = 2000,
}: Props = {}): CopyToClipboard => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) return false;

      let success = false;

      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          success = true;
        } else if (window.isSecureContext) {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            success = document.execCommand('copy');
          } finally {
            document.body.removeChild(textArea);
          }
        }

        if (success) {
          setCopiedText(text);
          setIsCopied(true);
          
          setTimeout(() => {
            setIsCopied(false);
          }, successDuration);
        }
      } catch (error) {
        console.error('Error al copiar al portapapeles:', error);
        success = false;
      }

      return success;
    },
    [successDuration]
  );

  return { isCopied, copiedText, copyToClipboard };
};