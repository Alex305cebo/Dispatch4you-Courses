// Схемы инструментов. Импортируются ТОЛЬКО дев-сервером (server/devProxy.ts),
// поэтому в бандл фронта не попадают — вместе с системным промптом это всё,
// что стоит держать подальше от клиента. Выполняет инструменты CallMachine,
// ему для этого достаточно имени и аргументов.

export const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'lookup_carrier',
      description:
        'Run the carrier MC number through the system. Call this the moment the dispatcher gives you an MC number — never take their word for authority, insurance or safety rating.',
      parameters: {
        type: 'object',
        properties: {
          mc_number: { type: 'string', description: 'MC number exactly as the dispatcher said it' },
        },
        required: ['mc_number'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'pull_up_load',
      description:
        'Open the load record so you can read the details out. Call this BEFORE describing route, commodity, weight, pickup or delivery. Never state load details from memory.',
      // Пустой properties: {} валидатор Groq отвергает — «/properties does not
      // validate» — и роняет ЗАПРОС ЦЕЛИКОМ, на всех моделях сразу. Поэтому у
      // инструмента без аргументов всё равно есть один необязательный: он и
      // схему делает валидной, и по делу полезен.
      parameters: {
        type: 'object',
        properties: {
          reference: {
            type: 'string',
            description: 'Load reference number, if the dispatcher named one',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'record_equipment',
      description: 'Log what equipment the carrier runs, once they tell you.',
      parameters: {
        type: 'object',
        properties: {
          equipment: { type: 'string', description: 'What they said they run, verbatim' },
        },
        required: ['equipment'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'record_driver_status',
      description:
        'Log where the driver is and whether they can make the pickup window, once the dispatcher answers.',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'Driver location as given' },
          can_make_pickup: { type: 'boolean', description: 'Can the driver make the pickup window' },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_market_rate',
      description:
        'Look up current market data for this lane. Use it when the dispatcher quotes market numbers at you, or before you decide how hard to push back.',
      parameters: {
        type: 'object',
        properties: {
          lane: { type: 'string', description: 'Lane to check, if different from the posted load' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'propose_rate',
      description:
        'Run the rate the dispatcher is asking for through pricing. Call this EVERY time they name a number. The result tells you whether to accept, counter, or hold firm — you do not decide this yourself.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Dollar amount the dispatcher asked for, all-in' },
        },
        required: ['amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'record_booking_details',
      description:
        'Log booking information as the dispatcher gives it. Call with whichever fields you just heard — you do not need all of them at once.',
      parameters: {
        type: 'object',
        properties: {
          driver_name: { type: 'string' },
          truck_number: { type: 'string' },
          trailer_number: { type: 'string' },
          driver_phone: { type: 'string' },
          email: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_rate_con',
      description: 'Send the rate confirmation once booking details are collected.',
      parameters: {
        type: 'object',
        properties: { email: { type: 'string', description: 'Email to send it to' } },
        required: ['email'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'end_call',
      description:
        'End the call. Use it when the booking is done, when there is clearly no deal, or when the dispatcher is wasting your time and you have run out of patience.',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            enum: ['booked', 'no_deal', 'broker_hung_up', 'carrier_rejected'],
          },
        },
        required: ['reason'],
      },
    },
  },
] as const

export const TOOL_NAMES = TOOL_SCHEMAS.map((t) => t.function.name)
