function Bamboo() {
  return (
    <svg
      className="hero-art__bamboo"
      viewBox="0 0 360 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMaxYMin meet"
    >
      <g className="bamboo bamboo--back">
        <path
          d="M320 620C310 472 316 318 342 42"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <g stroke="currentColor" strokeWidth="0.9" opacity=".55">
          <path d="M315 510q15 7 30 2" />
          <path d="M317 402q15 7 30 1" />
          <path d="M320 294q16 7 30 0" />
          <path d="M326 190q15 6 29 0" />
          <path d="M332 96q14 5 27 -1" />
        </g>
      </g>
      <g className="bamboo bamboo--main">
        <path
          d="M266 620C255 456 258 288 288 12"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <g stroke="currentColor" strokeWidth="1.1" opacity=".65">
          <path d="M260 538q18 8 35 2" />
          <path d="M262 438q18 8 34 1" />
          <path d="M265 336q18 8 34 0" />
          <path d="M270 234q18 7 33 0" />
          <path d="M275 132q17 6 31 -1" />
          <path d="M281 54q15 5 28 -1" />
        </g>
        <g className="bamboo__branches">
          <path d="M268 332C236 308 204 282 158 262" stroke="currentColor" strokeWidth="1.5" />
          <path d="M271 232C238 208 206 178 174 146" stroke="currentColor" strokeWidth="1.4" />
          <path d="M278 140C252 110 226 86 188 64" stroke="currentColor" strokeWidth="1.2" />
          <path d="M280 438C246 426 214 402 188 378" stroke="currentColor" strokeWidth="1.5" />
        </g>
      </g>
      <g className="bamboo__leaves" fill="currentColor">
        <path d="M161 263C124 250 91 222 54 205c31 36 64 57 103 70z" opacity=".55" />
        <path d="M160 266c-34 19-54 46-70 82 35-20 60-48 82-72z" opacity=".42" />
        <path d="M174 147c-32-6-67-30-102-30 30 25 62 38 97 42z" opacity=".5" />
        <path d="M176 151c-7 33-27 59-55 79 12-32 29-58 42-84z" opacity=".38" />
        <path d="M188 64C162 55 142 31 112 20c20 25 46 43 74 54z" opacity=".46" />
        <path d="M188 378c-29 5-58 24-92 31 30-32 60-39 88-42z" opacity=".4" />
        <path d="M224 226c29-17 50-44 82-60-13 37-47 65-79 78z" opacity=".32" />
        <path d="M303 237c19-24 45-40 57-68 3 31-19 57-48 82z" opacity=".3" />
        <path d="M327 468c23-12 38-34 64-44-8 27-31 45-55 54z" opacity=".28" />
        <path d="M300 324c24 2 50-9 72 0-18 17-45 22-69 18z" opacity=".25" />
      </g>
      <g className="bamboo bamboo--thin">
        <path
          d="M224 620C216 500 214 382 226 262"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity=".55"
        />
        <g stroke="currentColor" strokeWidth=".8" opacity=".5">
          <path d="M217 548q12 4 23 1" />
          <path d="M218 462q12 4 23 1" />
          <path d="M220 374q12 4 23 1" />
          <path d="M222 300q12 4 22 0" />
        </g>
        <g className="bamboo__leaves" fill="currentColor" opacity=".7">
          <path d="M226 300c-18-12-34-28-58-35 15 21 37 34 55 43z" opacity=".5" />
          <path d="M226 302c-6 22-21 38-39 51 7-22 20-39 29-56z" opacity=".4" />
        </g>
      </g>
    </svg>
  )
}

function Birds() {
  return (
    <svg
      className="hero-art__birds"
      viewBox="0 0 180 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8 30c7-7 14-7 21 0 7-7 14-7 21 0" />
      <path d="M88 18c5-5 10-5 15 0 5-5 10-5 15 0" />
      <path d="M124 52c4-4 8-4 12 0 4-4 8-4 12 0" />
    </svg>
  )
}

function Mountains() {
  return (
    <svg
      className="hero-art__mountains"
      viewBox="0 0 1440 520"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mountain-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3ecdd" stopOpacity="0" />
          <stop offset="1" stopColor="#f3ecdd" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <path
        className="mountain mountain--far"
        d="M0 382C88 350 164 382 250 350c74-27 118-90 206-92 83-2 134 74 220 74 92 0 138-68 220-62 82 6 142 58 224 47 84-11 146 7 320-5v208H0z"
      />
      <path
        className="mountain mountain--mid"
        d="M0 438c120-41 203 24 306-4 94-25 139-92 235-93 98-1 146 99 250 92 95-6 148-71 250-58 90 12 135 70 399 25v120H0z"
      />
      <path
        className="mountain mountain--near"
        d="M0 486c108-30 183 14 286-4 96-17 154-63 255-49 104 14 153 69 257 53 92-14 151-63 254-47 99 15 160 53 388 15v66H0z"
      />
      <rect y="300" width="1440" height="220" fill="url(#mountain-fade)" />
    </svg>
  )
}

export function HeroBackdrop() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__sun" />
      <div className="hero-art__sun-halo" />
      <div className="hero-art__mist hero-art__mist--one" />
      <div className="hero-art__mist hero-art__mist--two" />
      <Birds />
      <Bamboo />
      <Mountains />
      <span className="hero-art__watermark">前程</span>
    </div>
  )
}
