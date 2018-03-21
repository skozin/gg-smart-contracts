import Koa from 'koa'
import KoaBody from 'koa-body'
import KoaRouter from 'koa-router'
import cors from 'koa-cors'
import Joi from 'joi'

import notifyWhenCompleted from './utils/notify-when-completed'
import * as ErrorCodes from '../../shared/error-codes'

const PORT = 3000

const app = new Koa()
const router = KoaRouter()
const koaBody = KoaBody()

const TODO_IMPLEMENT = new Promise(resolve => resolve({TODO: 'implement'}))
// const mock = new Mock()

router.post('/api/ping', koaBody, ctx => {
  console.log('[/api/ping]', ctx.request.body)

  const schema = Joi.object().keys({
    ping: Joi.string().required(),
  })

  const {error, value} = Joi.validate(ctx.request.body, schema)

  if (error !== null) {
    ctx.throw(400, error.details[0].message)
  } else {
    ctx.body = JSON.stringify(ctx.request.body)
  }
})

// Consts
const ETH_ADDRESS_REGEX = /^0x([a-fA-F0-9]{40})$/
const BIG_NUMBER_REGEX = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/
const STUB_ADDRESS = '0x0e5415a15678F3316F530CFACe9a6f120BBBBBBB'

const JOI_ETH_ADDRESS = Joi.string()
  .regex(ETH_ADDRESS_REGEX)
  .required()

const JOI_BIG_NUMBER = Joi.string()
  .regex(BIG_NUMBER_REGEX)
  .required()

const JOI_STATUS_MAP = Joi.object().pattern(ETH_ADDRESS_REGEX, Joi.number().required())

// Public API
// GET wallet-address
router.get('/api/wallet-address', async ctx => {
  console.log('[/api/wallet-address]')

  // const address = await mock.getWalletAddress()
  const address = await TODO_IMPLEMENT

  ctx.body = {address}
})

// GET check-balances/:address
router.get('/api/check-balances/:address', async ctx => {
  console.log('[/api/checkBalances]', ctx.params)

  const address = ctx.params['address']
  if (!address.match(ETH_ADDRESS_REGEX)) {
    ctx.throw(400, JSON.stringify({error: 'address is invalid'}))
  }

  // const result = await mock.getBalance(address)
  const result = await TODO_IMPLEMENT
  ctx.body = result
})

// POST deploy-contract
router.post('/api/deploy-contract', koaBody, ctx => {
  console.log('[/api/deploy-contract]', ctx.request.body)

  const schema = Joi.object().keys({
    callback: Joi.string().required(),
    payload: {
      tokenContractAddress: JOI_ETH_ADDRESS,
      clientAddress: JOI_ETH_ADDRESS,
      approvalCommissionBenificiaryAddress: JOI_ETH_ADDRESS,
      disapprovalCommissionBeneficiaryAddress: JOI_ETH_ADDRESS,
      approvalCommissionFraction: Joi.number().required(),
      disapprovalCommissionFraction: Joi.number().required(),
      totalWorkItems: Joi.number().required(),
      workItemPrice: JOI_BIG_NUMBER,
      autoApprovalTimeoutSec: Joi.number().required(),
    },
  })

  const {error, value} = Joi.validate(ctx.request.body, schema)

  if (error !== null) {
    ctx.throw(400, JSON.stringify({error: error.details[0].message}))
  }

  const {callback, payload} = ctx.request.body

  // const promise = mock.deployContract(payload).then(contractAddress => ({contractAddress}))
  const promise = TODO_IMPLEMENT

  const taskId = notifyWhenCompleted(callback, promise)
  ctx.body = {taskId}
})

// POST update-completed-work
router.post('/api/update-completed-work', koaBody, ctx => {
  console.log('[/api/update-completed-work]', ctx.request.body)

  const schema = Joi.object().keys({
    callback: Joi.string().required(),
    contractAddress: JOI_ETH_ADDRESS,
    payload: JOI_STATUS_MAP,
  })

  const {error, value} = Joi.validate(ctx.request.body, schema)

  if (error !== null) {
    ctx.throw(400, JSON.stringify({error: error.details[0].message}))
  }

  const {callback, contractAddress, payload} = ctx.request.body

  // const promise = mock
  //   .updateCompletedWork(contractAddress, payload)
  //   .then(contractAddress => ({contractAddress}))

  const promise = TODO_IMPLEMENT

  const taskId = notifyWhenCompleted(callback, promise)
  ctx.body = {taskId}
})

// GET contract-status
router.get('/api/contract-status/:address', async ctx => {
  console.log('[/api/contract-status]', ctx.params)

  const address = ctx.params['address']
  if (!address.match(ETH_ADDRESS_REGEX)) {
    ctx.throw(400, JSON.stringify({error: 'address is invalid'}))
  }
  try {
    ctx.body = await TODO_IMPLEMENT
    // ctx.body = await mock.getContractState(address)
  } catch (err) {
    console.log(err.message, err.code)
    if (err.code === ErrorCodes.CONTRACT_NOT_FOUND) {
      ctx.throw(404, JSON.stringify({error: err.message}))
    }
    throw err
  }
})

// POST force-finalize
router.post('/api/force-finalize', koaBody, ctx => {
  console.log('[/api/force-finalize]', ctx.request.body)

  const schema = Joi.object().keys({
    callback: Joi.string().required(),
    contractAddress: JOI_ETH_ADDRESS,
  })

  const {error, value} = Joi.validate(ctx.request.body, schema)

  if (error !== null) {
    ctx.throw(400, JSON.stringify({error: error.details[0].message}))
  }

  const {callback, contractAddress} = ctx.request.body

  // const promise = mock.forceFinalizeContract(contractAddress)
  const promise = TODO_IMPLEMENT

  const taskId = notifyWhenCompleted(callback, promise)
  ctx.body = {taskId}
})

// POST credit-account
router.post('/api/credit-account', koaBody, ctx => {
  console.log('[/api/credit-account]', ctx.request.body)

  const schema = Joi.object().keys({
    callback: Joi.string().required(),
    payload: {
      tokenContractAddress: JOI_ETH_ADDRESS,
      recepientAddress: JOI_ETH_ADDRESS,
      etherValue: JOI_BIG_NUMBER,
      tokenValue: JOI_BIG_NUMBER,
    },
  })

  const {error, value} = Joi.validate(ctx.request.body, schema)

  if (error !== null) {
    ctx.throw(400, JSON.stringify({error: error.details[0].message}))
  }

  const {
    callback,
    payload: {tokenContractAddress, recepientAddress, tokenValue, etherValue},
  } = ctx.request.body

  // const promise = mock.creditAccount(tokenContractAddress, recepientAddress, tokenValue, etherValue)
  const promise = TODO_IMPLEMENT

  const taskId = notifyWhenCompleted(callback, promise)
  ctx.body = {taskId}
})

// Internal API

// POST _transferTokens
router.post('/api/_transferTokens', koaBody, async ctx => {
  console.log('[/api/_transferTokens]', ctx.request.body)

  const schema = Joi.object().keys({
    from: JOI_ETH_ADDRESS,
    to: JOI_ETH_ADDRESS,
    amount: JOI_BIG_NUMBER,
  })

  const {error, value} = Joi.validate(ctx.request.body, schema)

  if (error !== null) {
    ctx.throw(400, JSON.stringify({error: error.details[0].message}))
  }

  const {from, to, amount} = ctx.request.body

  try {
    // await mock.transferTokens(from, to, amount)
    await TODO_IMPLEMENT
  } catch (err) {
    console.log(err.message, err.code)
    if (err.code === ErrorCodes.INSUFFICIENT_ETHER_BALANCE) {
      ctx.throw(400, JSON.stringify({error: err.message}))
    }
    throw err
  }

  ctx.body = {status: 'ok'}
})

router.post('/api/_test-callback', koaBody, ctx => {
  console.log('POST /api/_test-callback:', ctx.request.body)
  ctx.body = {ok: true}
})

app.use(cors())
app.use(router.routes())
app.listen(PORT)

console.log(`Listening on ${PORT}`)
