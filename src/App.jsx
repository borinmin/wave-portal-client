import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";


export default function App() {
  
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWave, setTotalWave] = useState(0);
  const [allWaves, setAllWaves] = useState();
  const [message, setMessage] = useState('')


    const contractAddress = "0x74043186e703A583712Cf2B46BD435Fa4d20e675";
  const contractABI = abi.abi;
  

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log('accounts', accounts)
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
    * Implement your connectWallet method here
    */

  useEffect(() => {
    console.log("First load")
    checkIfWalletIsConnected();
    let allWaves = getAllWaves();
    setTotalWave(allWaves.length)
    setAllWaves(allWaves)
    console.log('length',allWaves.length)
  }, [])
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
  const wave = async (message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        console.log("signer", signer)
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*x
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        let count_last = await wavePortalContract.getTotalWaves();
         setTotalWave(count_last.toNumber())

        console.log('count_last',count_last.toNumber())

        // count = await wavePortalContract.getTotalWaves();
        // console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves()

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned)
        setTotalWave(wavesCleaned.length)

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }




  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          Hi, I am <strong><a href="https://www.facebook.com/borinmin.dev">Unknown</a></strong> person. Let's <strong>express</strong> how was your day 🙁 to my baby Smart Contract 🤖. Your day ⏰ today will never lose from here and you can see it in later day, plus anyone who comes here will see it too. Ohh that's 🆒 👀. 
        </div>
         {currentAccount && (
          
          <div style={{display:'contents'}}>
             <p className='waveButton'><strong>{totalWave}</strong> waves so far hehe: </p>
          <p>Last 10 messages:</p>
            <textarea onChange={(e => setMessage(e.target.value))}/>
           <button className="waveButton" onClick={ async()=>{
            alert('⏰ Waving may take 10 sec for waiting.')
             await wave(message)
             alert('Finished!!!')
              console.log("input message",message)
           }}>
          Wave at Me
        </button>
        </div>
        )}
       
        <div>
         
          {totalWave>0 && <div>
            {console.log('allWave',allWaves)
             
            }
            {allWaves.slice(-10).map((el,index) => 
              <p> {el.address}: <span>{el.message}</span>  </p>
            )}
            
          </div>}
        </div>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
