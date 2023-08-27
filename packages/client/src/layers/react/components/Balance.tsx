import { BigNumber, Signer } from "ethers";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, Container, Relative, Title } from "./common";
import { ecoji } from "../../../utils/ecoji";
import { FaucetServiceClient } from "@latticexyz/services/protobuf/ts/faucet/faucet";
import { ActionState } from "@latticexyz/std-client";
import { ActionStatusIcon } from "./Action";
import { Observable } from "rxjs";

const DEFAULT_TEXT = "Play LOOTCraft https://lootcraft.buidl.day \n\n";
const TWITTER_URL = "https://twitter.com/intent/tweet?text=";
const SIGNATURE_TEXT = (handle: string, address: string) => `${handle} tweetooor requesting drip to ${address} address`;

export const Balance: React.FC<{
  address: string;
  signer: Signer;
  balanceGwei$: Observable<number>;
  isMainWorld: boolean;
}> = ({ address, signer, balanceGwei$, isMainWorld }) => {
  const [open, setOpen] = useState(false);
  const [timeToDrip, setTimeToDrip] = useState(60000);
  const [balance, setBalance] = useState(0);


  async function updateBalance() {
    const balance = await signer.getBalance().then((v) => v.div(BigNumber.from(10).pow(9)).toNumber());
    setBalance(balance);
  }

  async function getTimeToDrip() {
    const res = await fetch(`https://lootcraft-faucet.buidl.day/${address}`);
    const time = await res.json();
    setTimeToDrip(time);
  }

  async function requestDrip() {
    try {
      const res = await fetch(`https://lootcraft-faucet.buidl.day`, { 
        method: 'post', 
        body: JSON.stringify({ walletAddress: address }), 
        headers: { 
          'content-type': 'application/json',
        },
      });
      const result = await res.json();
      if (result) {
        setTimeToDrip(86400000);
      } else {
        alert(result?.message);
      }
    } catch(err) {
      alert((err as any)?.message);
    }
  }

  if (isMainWorld) {
    useEffect(() => {
      getTimeToDrip();
    }, []);
    // Decrease the time until next drip once per second
    useEffect(() => {
      const interval = setInterval(() => {
        setTimeToDrip((ttd) => ttd - 1000);
      }, 1000);
      return () => clearInterval(interval);
    }, []);
  }

  // Update balance in regular intervals
  useEffect(() => {
    const subscription = balanceGwei$.subscribe((balance) => {
      setBalance(balance);
    });
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <>
      <BalanceContainer>
        <p>
          <Title>Hello,</Title> {address?.substring(0, 6) + "..."}
        </p>
        <p>Balance: {balance} GWEI</p>
        { address && <Button style={{ marginTop: 8 }} onClick={() => navigator.clipboard.writeText(address)}>Copy Address</Button>}
        { timeToDrip <= 0 && <Button style={{ marginTop: 8 }} onClick={() => requestDrip()}>Reqeust Drip</Button>}        
      </BalanceContainer>
    </>
  );
};

const BalanceContainer = styled(Container)`
  line-height: 1;
  pointer-events: all;
  max-width:

  .ActionStatus--spin {
    animation: spin 1s linear infinite;
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
  .ActionStatus--gray {
    color: hsl(0, 0%, 60%);
  }
  .ActionStatus--red {
    color: hsl(0, 60%, 60%);
  }
  .ActionStatus--green {
    color: hsl(120, 60%, 60%);
  }
`;
