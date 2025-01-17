import Image from 'next/image';
import {
  UnknownCoin,
  CoinIcon,
  EarningBox,
  Container,
  HeadContent,
  HeadSplit,
  IntervalContainer,
  FiatValue,
  IntervalItem,
  StartMiningContainer,
  EstimatedNumbers,
  CryptoValue,
  PoolDetails,
  Desc,
} from './components';
import React, { useReducer } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Button } from 'src/components/Button';
import { Content } from 'src/components/layout/Content';
import { Skeleton } from 'src/components/layout/Skeleton';
import { Spacer } from 'src/components/layout/Spacer';
import { Tooltip, TooltipContent } from 'src/components/Tooltip';
import { useCounterTicker } from 'src/rdx/localSettings/localSettings.hooks';
import { Checkbox } from '@/components/Form/Checkbox';
import { ApiPoolCoinFull } from 'src/types/PoolCoin.types';
import {
  useLocalizedCurrencyFormatter,
  useLocalizedNumberFormatter,
  useLocalizedPercentFormatter,
} from 'src/utils/si.utils';
import { getCoinIconUrl } from 'src/utils/staticImage.utils';
import styled from 'styled-components';
import usePoolCoinsFullQuery from '@/hooks/api/usePoolCoinsFullQuery';
import Badge from '@/components/Badge';
export const recaptchaKey = process.env.REACT_APP_RECAPTCHA_KEY;

const DualMineCheckBoxWrapper = styled.div`
  min-height: 24px;

  label {
    align-items: center;
  }
`;

const DualMineCoinIcon = styled.div`
  margin: 0 6px;
`;

const DualMineCheckboxLabelContainer = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
`;

const Uppercase = styled.span`
  text-transform: uppercase;
`;

const HeadWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const getCoinPoolFee = (coin: string) => {
  return coin === 'eth'
    ? 9 / 1000
    : coin === 'etc'
    ? 9 / 1000
    : coin === 'xch'
    ? 7 / 1000
    : coin === 'zil'
    ? 20 / 1000
    : coin === 'btc'
    ? 1 / 1000
    : coin === 'tiron'
    ? 0
    : coin === 'iron'
    ? 95 / 10000
    : 10 / 1000;
};
const CoinEarningsItem: React.FC<{
  data?: ApiPoolCoinFull;
  dualMineCoin?: ApiPoolCoinFull;
}> = ({ data, dualMineCoin }) => {
  const [isDualMining, toggleDualMining] = useReducer((t) => !t, true);

  const counterTicker = useCounterTicker();
  const counterPrice = data?.marketData.prices
    ? data?.marketData.prices[counterTicker]
    : 0;

  var prefixMultiplier = 1;

  if (data?.defaultHashrateSiPrefix === 'k') {
    prefixMultiplier = 1000;
  } else if (data?.defaultHashrateSiPrefix === 'M') {
    prefixMultiplier = 1000000;
  } else if (data?.defaultHashrateSiPrefix === 'G') {
    prefixMultiplier = 1000000000;
  } else if (data?.defaultHashrateSiPrefix === 'T') {
    prefixMultiplier = 1000000000000;
  }

  const dailyPer100 = data
    ? (((data.chainData.dailyRewardPerGigaHashSec / 1000000000) *
        prefixMultiplier) /
        Math.pow(10, data.decimalPlaces)) *
      100
    : 0;
  const monthlyPer100 = dailyPer100 * 30.5;

  const dualMineDailyPer100 = dualMineCoin
    ? (((dualMineCoin.chainData.dailyRewardPerGigaHashSec / 1000000000) *
        prefixMultiplier) /
        Math.pow(10, dualMineCoin.decimalPlaces)) *
      100
    : 0;

  const dualMineMonthlyPer100 = dualMineDailyPer100 * 30.5;

  const monthlyCounterPrice = monthlyPer100 * counterPrice;
  const dailyCounterPrice = dailyPer100 * counterPrice;

  const dualMineCoinCounterPrice = dualMineCoin?.marketData.prices
    ? dualMineCoin?.marketData.prices[counterTicker]
    : 0;

  const monthlyDualMineCounterPrice =
    dualMineMonthlyPer100 * dualMineCoinCounterPrice;
  const dailyDualMineCounterPrice =
    dualMineDailyPer100 * dualMineCoinCounterPrice;

  const calculatedDailyCounterPrice = isDualMining
    ? dailyCounterPrice + dailyDualMineCounterPrice
    : dailyCounterPrice;

  const calculatedMonthlyCounterPrice = isDualMining
    ? monthlyCounterPrice + monthlyDualMineCounterPrice
    : monthlyCounterPrice;

  const { t } = useTranslation('home');
  const currencyFormatter = useLocalizedCurrencyFormatter();
  const percentFormatter = useLocalizedPercentFormatter();
  const numberFormatter = useLocalizedNumberFormatter();

  const renderDualMineCheckbox = (dualMineCoin) => {
    return (
      <DualMineCheckboxLabelContainer>
        {t('coin_earnings_cards.dual_mine')}{' '}
        <DualMineCoinIcon>
          <Image
            alt={`${dualMineCoin?.name} icon`}
            width={20}
            height={20}
            src={getCoinIconUrl(dualMineCoin?.ticker, 'small')}
          />
        </DualMineCoinIcon>{' '}
        <Uppercase>{dualMineCoin.ticker}</Uppercase> (+
        {percentFormatter(dailyDualMineCounterPrice / dailyCounterPrice)}{' '}
        {t('coin_earnings_cards.earnings')})
      </DualMineCheckboxLabelContainer>
    );
  };

  const renderPoolFee = (coin: string, dualMineCoin?: string) => {
    const dualMineBoost = dailyDualMineCounterPrice / dailyCounterPrice;

    // TODO: Reenable this back
    // const poolFee = dualMineCoin
    //   ? getCoinPoolFee(dualMineCoin) * dualMineBoost + getCoinPoolFee(coin)
    //   : getCoinPoolFee(coin);

    const poolFee = getCoinPoolFee(coin);

    return (
      <>
        {t('coin_earnings_cards.pool_fee', {
          value: percentFormatter(poolFee),
        })}{' '}
        {coin === 'eth' && (
          <Tooltip plus>
            <TooltipContent>
              {t('coin_earnings_cards.mev', {
                value: `+ ${percentFormatter(0.95)}`,
              })}
            </TooltipContent>
          </Tooltip>
        )}
        {coin === 'xch' && (
          <Tooltip plus>
            <TooltipContent>
              {t('coin_earnings_cards.finder_reward', {
                value: `+ 0.25 ${coin.toUpperCase()}`,
              })}
            </TooltipContent>
          </Tooltip>
        )}
      </>
    );
  };

  return (
    <EarningBox>
      <HeadSplit>
        {(data?.ticker && (
          <CoinIcon
            alt={data.ticker}
            src={getCoinIconUrl(data?.ticker, 'medium')}
          />
        )) || <UnknownCoin />}
        <HeadContent>
          <h2>
            {data ? (
              <HeadWrapper>
                <span>{data.name}</span>
                {data.testnet && <Badge variant="warning">TESTNET</Badge>}
              </HeadWrapper>
            ) : (
              <Skeleton />
            )}
          </h2>
          <Desc>
            {t('coin_earnings_cards.estimated')}{' '}
            <Tooltip>
              <TooltipContent>
                {t('coin_earnings_cards.estimated_tooltip')}
              </TooltipContent>
            </Tooltip>
          </Desc>
        </HeadContent>
      </HeadSplit>
      <Spacer />
      <DualMineCheckBoxWrapper>
        {dualMineCoin && (
          <Checkbox
            label={renderDualMineCheckbox(dualMineCoin)}
            onChange={toggleDualMining}
            value={isDualMining as any}
          />
        )}
      </DualMineCheckBoxWrapper>
      <IntervalContainer>
        <IntervalItem>
          <p>
            100 {data?.defaultHashrateSiPrefix}
            {data?.hashrateUnit} {t('coin_earnings_cards.daily')}
          </p>

          {data?.testnet ? (
            <FiatValue>N/A</FiatValue>
          ) : (
            <EstimatedNumbers>
              <FiatValue>
                {calculatedDailyCounterPrice ? (
                  currencyFormatter(calculatedDailyCounterPrice)
                ) : (
                  <Skeleton style={{ height: 25 }} />
                )}
              </FiatValue>
              <CryptoValue>
                {dailyPer100 ? (
                  <>
                    {'≈ '}
                    {numberFormatter(dailyPer100, {
                      maximumFractionDigits: 5,
                    })}{' '}
                    {data?.ticker.toUpperCase()}
                    {dualMineCoin && isDualMining ? (
                      <>
                        {` + ${numberFormatter(dualMineDailyPer100, {
                          maximumFractionDigits: 2,
                        })} ${dualMineCoin?.ticker.toUpperCase()}`}
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <Skeleton style={{ height: 10 }} />
                )}
              </CryptoValue>
            </EstimatedNumbers>
          )}
        </IntervalItem>
        <IntervalItem>
          <p>
            100 {data?.defaultHashrateSiPrefix}
            {data?.hashrateUnit} {t('coin_earnings_cards.monthly')}
          </p>

          {data?.testnet ? (
            <FiatValue>N/A</FiatValue>
          ) : (
            <EstimatedNumbers>
              <FiatValue>
                {calculatedMonthlyCounterPrice ? (
                  currencyFormatter(calculatedMonthlyCounterPrice)
                ) : (
                  <Skeleton style={{ height: 25 }} />
                )}
              </FiatValue>
              <CryptoValue>
                {monthlyPer100 ? (
                  <>
                    {'≈ '}
                    {numberFormatter(monthlyPer100, {
                      maximumFractionDigits: 5,
                    })}{' '}
                    {data?.ticker.toUpperCase()}
                    {dualMineCoin && isDualMining ? (
                      <>
                        {` + ${numberFormatter(dualMineMonthlyPer100, {
                          maximumFractionDigits: 2,
                        })} ${dualMineCoin?.ticker.toUpperCase()}`}
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <Skeleton style={{ height: 10 }} />
                )}
              </CryptoValue>
            </EstimatedNumbers>
          )}
        </IntervalItem>
      </IntervalContainer>
      {data?.ticker && (
        <StartMiningContainer>
          <PoolDetails>
            <p>
              {renderPoolFee(
                data.ticker,
                dualMineCoin && isDualMining ? dualMineCoin.ticker : undefined
              )}
            </p>
          </PoolDetails>

          <Link href={`/get-started`} passHref>
            <Button variant="success">
              {data?.ticker === 'xch'
                ? t('coin_earnings_cards.cta_farm')
                : t('coin_earnings_cards.cta_mine')}
            </Button>
          </Link>
        </StartMiningContainer>
      )}
    </EarningBox>
  );
};

const FormContainer = styled.div`
  display: flex;
  margin-top: 1rem;
  justify-content: space-between;
  & > *:first-child {
    margin-right: 1rem;
    flex-grow: 1;
  }
`;

const ChiaBox = styled(EarningBox)`
  background: rgb(54, 173, 88);
  background: linear-gradient(
    135deg,
    rgba(54, 173, 88, 1) 0%,
    rgba(0, 0, 0, 0) 100%
  );
`;

const ChiaCoin = styled(UnknownCoin)`
  height: 60px;
  width: 60px;
  background: white;
`;

export const CoinEarnings = () => {
  const { data: coinsFull } = usePoolCoinsFullQuery();

  const dualMiningCoin = coinsFull?.filter((c) => c.isDual)[0];

  return (
    <Content style={{ maxWidth: '1300px' }}>
      <Spacer size="xl" />
      <Container>
        {coinsFull ? (
          coinsFull
            .filter((c) => !c.isDual)
            .filter((c) => !c.payoutsOnly)
            .map((item) => (
              <CoinEarningsItem
                key={item.ticker}
                data={item}
                dualMineCoin={
                  item.ticker === 'etc' ? dualMiningCoin : undefined
                }
              />
            ))
        ) : (
          <>
            <CoinEarningsItem />
            <CoinEarningsItem />
            <CoinEarningsItem />
          </>
        )}
      </Container>
    </Content>
  );
};
