export default function ResetRequest({ closeTab }: any) {
  return (
    <div className="w-[360px] h-full items-center flex justify-center">
      <div className="w-full">
        <div className="w-full flex-col bg-white items-center gap-[16px] justify-center flex rounded-[24px] shadow-lg border border-[#E4E7EC] py-[30px]">
          <span className="text-[16px] text-[#637083] items-center">
            <svg
              width="70"
              height="57"
              viewBox="0 0 70 57"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M44.5268 10.5186C44.5268 9.86113 43.9937 9.32812 43.3363 9.32812H15.9554C13.893 9.32812 12.0318 10.2052 10.7311 11.5999C9.54288 12.8739 8.8125 14.5898 8.8125 16.471V40.2805C8.8125 42.3146 9.66576 44.1531 11.0273 45.451C12.3069 46.6707 14.0458 47.4234 15.9554 47.4234H54.0506C55.9601 47.4234 57.6992 46.671 58.9787 45.451C60.3401 44.1531 61.1935 42.3146 61.1935 40.2805V27.8996C61.1935 27.2422 60.6604 26.7091 60.003 26.7091C59.3456 26.7091 58.8125 27.2422 58.8125 27.8996V40.2805C58.8125 41.6367 58.2456 42.8605 57.3358 43.7276C56.4813 44.5424 55.3244 45.0424 54.0506 45.0424H15.9554C14.6816 45.0424 13.5246 44.5424 12.6701 43.7276C11.7604 42.8605 11.1935 41.6367 11.1935 40.2805V16.471C11.1935 15.6444 11.4041 14.8669 11.7746 14.1894L31.3475 29.4205C33.4973 31.0936 36.5087 31.0936 38.6587 29.4205L47.4008 23.4929C47.9196 23.0891 48.013 22.341 47.6092 21.8222C47.2054 21.3034 46.4575 21.21 45.9385 21.6138L37.1963 27.5415C35.9063 28.5453 34.0996 28.5453 32.8096 27.5415L13.4104 12.4455C14.1465 11.9791 15.0194 11.7091 15.9554 11.7091H43.3363C43.9937 11.7091 44.5268 11.1761 44.5268 10.5186Z"
                fill="#97A1AF"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M56.8594 20.043C60.2507 20.043 63 17.2937 63 13.9023C63 10.511 60.2507 7.76172 56.8594 7.76172C53.4681 7.76172 50.7188 10.511 50.7188 13.9023C50.7188 17.2937 53.4681 20.043 56.8594 20.043Z"
                fill="#3B82F6"
              />
            </svg>
          </span>
          <div className="w-full px-[30px] items-center text-center flex justify-center">
            <p className="text-[16px] text-[#637083]">
              Password reset link sent to your email. Check Spam/Junk if needed.{' '}
              {/* <br /> You can{' '}
              <button
                className="text-[#3B82F6] underline cursor-pointer bg-transparent border-none p-0"
                onClick={(e) => {
                  e.preventDefault();
                  closeTab();
                }}
              >
                close this tab
              </button> */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
