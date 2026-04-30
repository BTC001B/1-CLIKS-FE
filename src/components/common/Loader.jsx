import React from 'react';
import styled, { keyframes } from 'styled-components';

const draw = keyframes`
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(27, 107, 58, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 40px 10px rgba(27, 107, 58, 0.2);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Loader = () => {
    return (
        <StyledWrapper>
            <div className="loader-container">
                <div className="logo-pulse">
                    <svg viewBox="0 0 500 500" className="cliks-svg">
                        {/* Outer rotating ring */}
                        <circle 
                            cx="250" 
                            cy="250" 
                            r="230" 
                            fill="none" 
                            stroke="#1B6B3A" 
                            strokeWidth="4" 
                            strokeDasharray="40 120"
                            className="rotating-ring"
                        />
                        
                        {/* Main logo circle */}
                        <circle cx="250" cy="250" r="200" fill="#064E3B" />
                        
                        {/* Inner white ring */}
                        <circle cx="250" cy="250" r="145" fill="none" stroke="white" strokeWidth="35" opacity="1" />
                        
                        {/* New Refined Stylized checkmark */}
                        <path 
                            d="M160 249C160 249 180 219 200 229C220 239 240 319 240 319C240 319 325 174 425 109C375 184 265 364 240 364C215 364 160 249 160 249Z" 
                            fill="white"
                            className="checkmark-fade"
                        />
                    </svg>
                </div>
                <div className="loading-text">
                    <span>C</span>
                    <span>L</span>
                    <span>I</span>
                    <span>K</span>
                    <span>S</span>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .logo-pulse {
    width: 120px;
    height: 120px;
    animation: ${pulse} 2s ease-in-out infinite;
    border-radius: 50%;
  }

  .cliks-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  }

  .rotating-ring {
    animation: ${rotate} 4s linear infinite;
    transform-origin: center;
  }

  .checkmark-fade {
    animation: ${pulse} 2s ease-in-out infinite;
    transform-origin: center;
  }

  .loading-text {
    font-family: 'Inter', sans-serif;
    display: flex;
    gap: 8px;
    
    span {
      color: #1B6B3A;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 4px;
      animation: text-pulse 1.5s ease-in-out infinite;
      opacity: 0.3;
      
      &:nth-child(1) { animation-delay: 0.0s; }
      &:nth-child(2) { animation-delay: 0.1s; }
      &:nth-child(3) { animation-delay: 0.2s; }
      &:nth-child(4) { animation-delay: 0.3s; }
      &:nth-child(5) { animation-delay: 0.4s; }
    }
  }

  @keyframes text-pulse {
    0%, 100% {
      opacity: 0.3;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-4px);
    }
  }
`;

export default Loader;
