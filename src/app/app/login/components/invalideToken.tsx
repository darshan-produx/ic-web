export default function InvalideToken({ setLoadingPage }: any) {
  return (
    <div className="w-[360px] h-full items-center flex justify-center">
      <div className="w-full">
        <div className="w-full flex-col bg-white items-center gap-[26px] justify-center flex rounded-[24px] shadow-lg border border-[#E4E7EC] py-[30px]">
          <span className="text-[16px] text-[#637083] items-center">
            <svg
              width="70"
              height="57"
              viewBox="0 0 70 57"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M44.5268 10.5186C44.5268 9.86113 43.9937 9.32812 43.3363 9.32812H15.9554C13.893 9.32812 12.0318 10.2052 10.7311 11.5999C9.54288 12.8739 8.8125 14.5898 8.8125 16.471V40.2805C8.8125 42.3146 9.66576 44.1531 11.0273 45.451C12.3069 46.6707 14.0458 47.4234 15.9554 47.4234H54.0506C55.9601 47.4234 57.6992 46.671 58.9787 45.451C60.3401 44.1531 61.1935 42.3146 61.1935 40.2805V27.8996C61.1935 27.2422 60.6604 26.7091 60.003 26.7091C59.3456 26.7091 58.8125 27.2422 58.8125 27.8996V40.2805C58.8125 41.6367 58.2456 42.8605 57.3358 43.7276C56.4813 44.5424 55.3244 45.0424 54.0506 45.0424H15.9554C14.6816 45.0424 13.5246 44.5424 12.6701 43.7276C11.7604 42.8605 11.1935 41.6367 11.1935 40.2805V16.471C11.1935 15.6444 11.4041 14.8669 11.7746 14.1894L31.3475 29.4205C33.4973 31.0936 36.5087 31.0936 38.6587 29.4205L47.4008 23.4929C47.9196 23.0891 48.013 22.341 47.6092 21.8222C47.2054 21.3034 46.4575 21.21 45.9385 21.6138L37.1963 27.5415C35.9063 28.5453 34.0996 28.5453 32.8096 27.5415L13.4104 12.4455C14.1465 11.9791 15.0194 11.7091 15.9554 11.7091H43.3363C43.9937 11.7091 44.5268 11.1761 44.5268 10.5186Z"
                fill="#97A1AF"
              />
              <g clipPath="url(#clip0_7637_34982)">
                <path
                  d="M57.0013 16.0456V13.7122M57.0013 11.3789H57.0071M62.8346 13.7122C62.8346 16.9339 60.223 19.5456 57.0013 19.5456C53.7796 19.5456 51.168 16.9339 51.168 13.7122C51.168 10.4906 53.7796 7.87891 57.0013 7.87891C60.223 7.87891 62.8346 10.4906 62.8346 13.7122Z"
                  stroke="#EF4444"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_7637_34982">
                  <rect
                    width="14"
                    height="14"
                    fill="white"
                    transform="translate(50 6.71094)"
                  />
                </clipPath>
              </defs>
            </svg>
          </span>
          <div className="w-full px-[30px] items-center text-center flex justify-center">
            <p className="text-[16px] text-[#637083]">
              Link is already used.
              <br /> Please create a new request for the password reset from
              login page
            </p>
          </div>
          <div className="w-full px-[29px] mb-4">
            <button
              id="forgot"
              type="submit"
              onClick={() => {
                window.history.replaceState({}, '', '/app');
                setLoadingPage('login');
              }}
              className="py-[10px] w-full rounded-2xl flex justify-center text-[16px] font-semibold text-white bg-[#1A75FF]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
