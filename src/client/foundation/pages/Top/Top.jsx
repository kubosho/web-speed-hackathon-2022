import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { difference } from "../../../../utils/difference";
import { Container } from "../../components/layouts/Container";
import { Spacer } from "../../components/layouts/Spacer";
import { Stack } from "../../components/layouts/Stack";
import { Heading } from "../../components/typographies/Heading";
import { useAuthorizedFetch } from "../../hooks/useAuthorizedFetch";
import { useFetch } from "../../hooks/useFetch";
import { Color, Radius, Space } from "../../styles/variables";
import { authorizedJsonFetcher, jsonFetcher } from "../../utils/HttpUtils";

import { ChargeDialog } from "./internal/ChargeDialog";
import { HeroImage } from "./internal/HeroImage";
import { RecentRaceList } from "./internal/RecentRaceList";

dayjs.extend(customParseFormat);

/**
 * @param {Model.Race[]} races
 * @returns {Model.Race[]}
 */
function useTodayRacesWithAnimation(races) {
  const [isRacesUpdate, setIsRacesUpdate] = useState(false);
  const [racesToShow, setRacesToShow] = useState([]);
  const numberOfRacesToShow = useRef(0);
  const prevRaces = useRef(races);
  const timer = useRef(null);

  useEffect(() => {
    const isRacesUpdate =
      difference(
        races.map((e) => e.id),
        prevRaces.current.map((e) => e.id),
      ).length !== 0;

    prevRaces.current = races;
    setIsRacesUpdate(isRacesUpdate);
  }, [races]);

  useEffect(() => {
    if (!isRacesUpdate) {
      return;
    }
    // 視覚効果 off のときはアニメーションしない
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRacesToShow(races);
      return;
    }

    numberOfRacesToShow.current = 0;
    if (timer.current !== null) {
      clearInterval(timer.current);
    }

    timer.current = setInterval(() => {
      if (numberOfRacesToShow.current >= races.length) {
        clearInterval(timer.current);
        return;
      }

      numberOfRacesToShow.current++;
      setRacesToShow(races.slice(0, numberOfRacesToShow.current));
    }, 100);
  }, [isRacesUpdate, races]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        clearInterval(timer.current);
      }
    };
  }, []);

  return racesToShow;
}

/** @type {React.VFC} */
export const Top = () => {
  const { date = dayjs().format("YYYY-MM-DD") } = useParams();

  const ChargeButton = styled.button`
    background: ${Color.mono[700]};
    border-radius: ${Radius.MEDIUM};
    color: ${Color.mono[0]};
    padding: ${Space * 1}px ${Space * 2}px;

    &:hover {
      background: ${Color.mono[800]};
    }
  `;

  const chargeDialogRef = useRef(null);

  const { data: userData, revalidate } = useAuthorizedFetch(
    "/api/users/me",
    authorizedJsonFetcher,
  );

  const since = dayjs(date).startOf("day").unix();
  const until = dayjs(date).endOf("day").unix();
  const { data: raceData } = useFetch(
    `/api/races?since=${since}&until=${until}`,
    jsonFetcher,
  );

  const handleClickChargeButton = useCallback(() => {
    if (chargeDialogRef.current === null) {
      return;
    }

    chargeDialogRef.current.showModal();
  }, []);

  const handleCompleteCharge = useCallback(() => {
    revalidate();
  }, [revalidate]);

  const todayRaces = raceData != null ? raceData.races : [];
  const todayRacesToShow = useTodayRacesWithAnimation(todayRaces);

  return (
    <Container>
      <HeroImage
        alt=""
        height="735"
        src="/assets/images/hero.jpg"
        width="1024"
      />

      <Spacer mt={Space * 2} />
      {userData && (
        <Stack horizontal alignItems="center" justifyContent="space-between">
          <div>
            <p>ポイント残高: {userData.balance}pt</p>
            <p>払戻金: {userData.payoff}Yeen</p>
          </div>

          <ChargeButton onClick={handleClickChargeButton}>
            チャージ
          </ChargeButton>
        </Stack>
      )}

      <Spacer mt={Space * 2} />
      <section>
        <Heading as="h1">本日のレース</Heading>
        {todayRacesToShow.length > 0 && (
          <RecentRaceList>
            {todayRacesToShow.map((race) => (
              <RecentRaceList.Item key={race.id} race={race} />
            ))}
          </RecentRaceList>
        )}
      </section>

      <ChargeDialog ref={chargeDialogRef} onComplete={handleCompleteCharge} />
    </Container>
  );
};
