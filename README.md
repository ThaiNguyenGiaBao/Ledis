# Ledis - A Lightweight Redis Clone

[Live Demo](https://ledis-five.vercel.app) • [GitHub Repository](https://github.com/ThaiNguyenGiaBao/Ledis)

## Description

Ledis is a minimal, browser-based clone of Redis implemented in vanilla JavaScript. It provides core Redis-like functionality—including string and set data types, key expiration, persistence, and a command-line interface—without any external dependencies or build steps.

## Features

- **Core Data Types**: `String`, `Set`
- **Commands**:
  - **String**: `SET`, `GET`
  - **Set**: `SADD`, `SMEMBERS`, `SREM`, `SINTER`
  - **Key**: `KEYS`, `DEL`, `EXPIRE`, `TTL`
  - **Snapshot**: `SAVE`, `RESTORE`
- **Expiration**:
  - Lazy removal on access (`isExpired` checks)
  - Periodic background garbage collection (every 5 seconds)
- **Persistence**: saves data to `localStorage` on `SAVE` and reloads on page refresh
- **Web-based CLI**: custom-built command parser and UI, no external libraries
- **Centralized Response Formatting**: unified `Response` class for consistent output
- **Reusable Error Handling**: `asyncHandler` wrapper for argument validation and error responses

## Architecture Overview

```
index.html → UI Layer → Ledis Core → Data Modules (String, Set, Key) → Entry/Response
```  

- **UI Layer**: captures user commands via a web CLI and forwards them to the core.
- **Ledis Core**: maintains a centralized `data` store (mapping keys to `Entry` objects) and a registry of command handlers.
- **Entry**: wraps stored values with metadata (`type`, expiration timestamp).
- **Response**: formats command results (OK, integer, bulk strings, arrays, nil, errors).
- **Garbage Collector**: sweeps expired keys at intervals to free memory.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ThaiNguyenGiaBao/Ledis.git
   ```
2. Open `index.html` in your browser:
   ```bash
   open index.html
   ```

_No build tools or package managers required._

## Usage

1. In the CLI, type Redis-like commands. Examples:
   ```
   SET mykey "hello"
   GET mykey          # => "hello"
   SADD myset a b c
   SMEMBERS myset     # => 1) "a" 2) "b" 3) "c"
   EXPIRE mykey 10    # set TTL to 10 seconds
   TTL mykey          # get remaining TTL
   SAVE               # persist to localStorage
   RESTORE            # reload from localStorage
   ```
2. Observe responses formatted Redis-style.

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing. Test suites cover:

- String commands (SET, GET)
- Set commands (SADD, SREM, SMEMBERS, SINTER)
- Key commands (KEYS, DEL, EXPIRE, TTL)
- Snapshot commands (SAVE, RESTORE)
- Error and edge-case handling

To run tests:
```bash
npm install
npm test
```

## Design Artifacts

- **Class Diagram**: illustrates relationships between UI, core, modules, and utilities.
- **Sequence Diagram**: shows command flow for operations like `SET name "bao"`.

(See `/docs` for diagrams and additional notes.)

## Technology Choices

- **Vanilla JavaScript**: no compile step, direct browser execution
- **No Frameworks**: avoids over-engineering for a lightweight demo

## Future Improvements

- Add more Redis commands (e.g., hashes, lists)
- Support background persistence (AOF or RDB-style snapshots)
- Enhance CLI UX (history, auto-completion)
- Integrate with a Node.js server for multi-client usage

## Contributing

Contributions, issues, and feature requests are welcome! Please feel free to check the [issues page](https://github.com/ThaiNguyenGiaBao/Ledis/issues).

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

