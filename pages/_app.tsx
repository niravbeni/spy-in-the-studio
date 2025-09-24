import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕵️</text></svg>" />
      </Head>
      <Component {...pageProps} />
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          overflow: hidden;
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }
        
        html {
          height: 100vh;
          height: -webkit-fill-available;
        }
        
        body {
          height: 100vh;
          height: -webkit-fill-available;
        }
        
        a {
          color: inherit;
          text-decoration: none;
        }
        
        button:focus,
        input:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
} 