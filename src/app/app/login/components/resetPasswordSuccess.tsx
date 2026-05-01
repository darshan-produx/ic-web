export default function ResetPasswordSuccess({ setLoadingPage }: any) {
  return (
    <div className="w-[360px] h-full items-center flex justify-center">
      <div className="w-full">
        <div className="w-full flex-col bg-white items-center gap-[26px] justify-center flex rounded-[24px] shadow-lg border border-[#E4E7EC] py-[30px]">
          <span className="text-[16px] text-[#637083] items-center">
            <svg
              width="58"
              height="57"
              viewBox="0 0 58 57"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_7637_34932)">
                <path
                  d="M51.5458 40.2877C52.7664 40.2877 53.7559 39.2982 53.7559 38.0776V29.9003C53.7559 25.0257 49.7901 21.0599 44.9155 21.0599H42.2593V13.2656C42.2593 6.10817 36.3107 0.285156 28.9988 0.285156C21.687 0.285156 15.7383 6.10817 15.7383 13.2656V21.0599H13.0903C8.21577 21.0599 4.25 25.0257 4.25 29.9003V48.0229C4.25 52.8975 8.21577 56.8633 13.0903 56.8633H34.9155C38.5 56.8633 38.5 52.4431 34.9155 52.4431H13.0903C10.6531 52.4431 8.67017 50.4602 8.67017 48.0229V29.9003C8.67017 27.463 10.6531 25.4801 13.0903 25.4801H44.9155C47.3528 25.4801 49.3357 27.463 49.3357 29.9003V38.0776C49.3357 39.2982 50.3251 40.2877 51.5458 40.2877ZM37.8392 21.0599H20.1585V13.2656C20.1585 8.54545 24.1243 4.70532 28.9988 4.70532C33.8734 4.70532 37.8392 8.54545 37.8392 13.2656V21.0599Z"
                  fill="#97A1AF"
                />
                <path
                  d="M6.46204 40.2877C5.24141 40.2877 4.25195 39.2982 4.25195 38.0776V29.9003C4.25195 25.0257 8.21773 21.0599 13.0923 21.0599H15.7485V13.2656C15.7485 6.10817 21.6971 0.285156 29.009 0.285156C36.3208 0.285156 42.2695 6.10817 42.2695 13.2656V21.0599H44.9175C49.792 21.0599 53.7578 25.0257 53.7578 29.9003V48.0229C53.7578 52.8975 49.792 56.8633 44.9175 56.8633H23.0923C19.5078 56.8633 19.5078 52.4431 23.0923 52.4431H44.9175C47.3548 52.4431 49.3376 50.4602 49.3376 48.0229V29.9003C49.3376 27.463 47.3548 25.4801 44.9175 25.4801H13.0923C10.655 25.4801 8.67212 27.463 8.67212 29.9003V38.0776C8.67212 39.2982 7.68266 40.2877 6.46204 40.2877ZM20.1686 21.0599H37.8493V13.2656C37.8493 8.54545 33.8835 4.70532 29.009 4.70532C24.1344 4.70532 20.1686 8.54545 20.1686 13.2656V21.0599Z"
                  fill="#97A1AF"
                />
                <path
                  d="M24.9132 40.7288C26.1338 40.7288 27.1233 39.7393 27.1233 38.5187C27.1233 37.2981 26.1338 36.3086 24.9132 36.3086C23.6926 36.3086 22.7031 37.2981 22.7031 38.5187C22.7031 39.7393 23.6926 40.7288 24.9132 40.7288Z"
                  fill="#97A1AF"
                />
                <path
                  d="M33.2023 40.7288C34.4229 40.7288 35.4124 39.7393 35.4124 38.5187C35.4124 37.2981 34.4229 36.3086 33.2023 36.3086C31.9817 36.3086 30.9922 37.2981 30.9922 38.5187C30.9922 39.7393 31.9817 40.7288 33.2023 40.7288Z"
                  fill="#97A1AF"
                />
                <g clipPath="url(#clip1_7637_34932)">
                  <rect
                    x="19"
                    y="29"
                    width="20"
                    height="20"
                    rx="10"
                    fill="#249782"
                  />
                  <path
                    d="M24.7109 40.0476L27.1109 42.3333L32.7109 37"
                    stroke="white"
                    strokeWidth="3.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="clip0_7637_34932">
                  <rect
                    width="56.5781"
                    height="56.5781"
                    fill="white"
                    transform="translate(0.710938 0.285156)"
                  />
                </clipPath>
                <clipPath id="clip1_7637_34932">
                  <rect
                    x="19"
                    y="29"
                    width="20"
                    height="20"
                    rx="10"
                    fill="white"
                  />
                </clipPath>
              </defs>
            </svg>
          </span>
          <div className="w-full px-[30px] items-center text-center flex justify-center">
            <p className="text-[16px] text-[#637083]">
              Password updated successfully
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
