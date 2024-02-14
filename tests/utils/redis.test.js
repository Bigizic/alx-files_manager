import { expect } from 'chai';
import redisClient from '../../utils/redis';

describe('+ RedisClient utility', () => {
  before(function (done) {
    this.timeout(10000);
    setTimeout(done, 4000);
  });

  it('+ Client is alive', () => {
    expect(redisClient.isAlive()).to.equal(true);
  });

  it('+ Set and get a value', async function () {
    await redisClient.set('key', 345, 10);
    expect(await redisClient.get('key')).to.equal('345');
  });

  it('+ Set and get an expired value', async function () {
    await redisClient.set('key', 356, 1);
    setTimeout(async () => {
      expect(await redisClient.get('key')).to.not.equal('356');
    }, 2000);
  });

  it('+ Set and get a deleted value', async function () {
    await redisClient.set('key', 345, 10);
    await redisClient.del('key');
    setTimeout(async () => {
      console.log('del: key ->', await redisClient.get('key'));
      expect(await redisClient.get('key')).to.be.null;
    }, 2000);
  });
});
