'use client'
import { useState, useEffect } from "react";

interface TreeNode {
  children: LetterMap,
  value: string,
  laterChars: Set<string>,
  terminus: boolean
}

interface LetterMap {
  [key: string]: TreeNode
}

export default function Home() {
  const [tree, setTree] = useState<null | TreeNode>(null);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<string[]>([]);

  useEffect(() => {
    const createTree = async () => {
      const words = await fetch("https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words.txt")
        .then(res => res.text())
        .then(text => text.split('\n'));

      const result: TreeNode = {
        children: {},
        value: '',
        laterChars: new Set(),
        terminus: false
      }

      // console.log('words', words);

      words.forEach(word => {
        if (word.includes('-')) return;
        let current = result;
        const letterArr = word.toLowerCase().split('')
        letterArr.forEach((char, i) => {
          letterArr.slice(i).forEach(letter => current.laterChars.add(letter));
          if (!current.children[char]) {
            current.children[char] = {
              children: {},
              value: char,
              laterChars: new Set(),
              terminus: false
            }
          }
          current = current.children[char];
          if (i === word.length - 1) current.terminus = true;
        });
      });
      setTree(await result);
    }
    createTree();
  }, []);

  // console.log('tree', tree);

  const calcWords = () => {
    const candidates: string[] = [];
    const findWord = (node: TreeNode, accumulated: string, remaining: string) => {
      accumulated += node.value;
      if (node.value === remaining[0]) remaining = remaining.slice(1);
      if (node.terminus && remaining === '') {
        candidates.push(accumulated);
      }
      const queue: TreeNode[] = [];
      const remainingSet = new Set(remaining.split(''));
      Object.values(node.children).forEach(child => {
        if (remainingSet.isSubsetOf(child.laterChars)) queue.push(child);
      })
      queue.forEach(child => findWord(child, accumulated, remaining));
    }
    findWord(tree as TreeNode, '', input);
    candidates.sort((a, b) => a.length < b.length ? -1 : 1);
    setResult(candidates);
    setSubmitted(true);
  }

  const othersString = result.slice(1, 10).join(', ');

  return (
    <div className="">
      <input className="m-3 border-box" type="text" value={input} onChange={e => setInput(e.target.value)}></input>
      <button onClick={calcWords}>Submit</button>
      {submitted && result.length > 0 && <div>
        The best word is {result[0]}. Other good words are {othersString}.
      </div>}
      {submitted && !result.length && <div>
        No words match this letter combination.
      </div>}
    </div>
  );
}
