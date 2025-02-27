import React, { useEffect } from 'react';
import { ALPH_TOKEN_ID } from '@alephium/web3';
import { Token } from '../../services/utils';

interface TokenSelectorProps {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onTokenChange: (token: Token | undefined) => void;
  tokens: Token[];
  isLoading: boolean;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  disabled,
  value,
  onChange,
  onTokenChange,
  tokens,
  isLoading
}) => {
  
  useEffect(() => {
    // Set the initial selected token
    if (value === ALPH_TOKEN_ID) {
      onTokenChange({
        id: ALPH_TOKEN_ID,
        name: "Alephium",
        symbol: "ALPH",
        decimals: 18,
        description: "Native token of Alephium blockchain",
        logoURI: ""
      });
    } else {
      const selectedToken = tokens.find(token => token.id === value);
      onTokenChange(selectedToken);
    }
  }, [value, tokens, onTokenChange]);
  
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTokenId = e.target.value;
    onChange(newTokenId);
    
    if (newTokenId === ALPH_TOKEN_ID) {
      onTokenChange({
        id: ALPH_TOKEN_ID,
        name: "Alephium",
        symbol: "ALPH",
        decimals: 18,
        description: "Native token of Alephium blockchain",
        logoURI: ""
      });
    } else {
      const selectedToken = tokens.find(token => token.id === newTokenId);
      onTokenChange(selectedToken);
    }
  };
  
  return (
    <div className="relative">
      <select
        disabled={disabled || isLoading}
        value={value}
        onChange={handleTokenChange}
        className={`block w-full px-3 py-3 text-xl text-black border-2 border-black appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <option value="">Loading tokens...</option>
        ) : (
          <>
            {tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.symbol}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

export default TokenSelector; 