import BigNumber from 'bignumber.js'
import BaseContract from './base-contract'
import {inspectTransaction} from './utils/tx-utils'

import {UserError} from './errors'
import * as ErrorCodes from './error-codes'

import builtTokenContract from '../../truffle/build/contracts/GraphGrailToken.json'


export default class ProjectContract extends BaseContract {
  static builtContract = builtTokenContract

  async totalSupply() {
    return await this.truffleContract.totalSupply()
  }

  async balanceOf(who) {
    return await this.truffleContract.balanceOf(who)
  }

  async transfer(to, value) {
    const tokenBalance = await this.balanceOf(this.account)

    if (tokenBalance.lt(new BigNumber(value))) {
      throw new UserError(`Wanted to send ${value} tokens to ${to}, but have only ${tokenBalance} `
        +`at current address ${this.account}`, ErrorCodes.INSUFFICIENT_TOKEN_BALANCE)
    }

    const result = await this._callContractMethod('transfer', [to, value])

    const transferEmitted = result.events.some(evt => evt.name === 'Transfer')
    if (!transferEmitted) {
      throw new UserError(`token transfer failed`, ErrorCodes.TRANSACTION_FAILED)
    }

    return result
  }

}
