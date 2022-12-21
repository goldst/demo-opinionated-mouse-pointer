import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { HatchButton, HatchFixedWidth, HatchInputField, HatchRadio, HatchToggle, HatchWrapper } from '@hatch/hds'
import '@hatch/hds/dist/global.min.css'
import '@hatch/hds/dist/T1.min.css'

function App() {
    const [[x, y], setXY] = useState<[number, number]>([0, 0]);
    const [locked, setLocked] = useState(false);

    const updatePosition = (e: MouseEvent, gravityPoints: ([number, number])[], rects: DOMRect[]) => {
        setXY(([x, y]) => {
            /*if(rects.some(rect =>
                rect.left < x &&
                rect.left + rect.width > x &&
                rect.top < y &&
                rect.top + rect.height > y
            )) {
                return [
                    x + e.movementX*0.8,
                    y + e.movementY*0.8,
                ];
            }*/
            
            //console.log('gravityPoints', gravityPoints);

            //console.log('e', e);

            const [middleX, middleY] = [
                x + (e.movementX/2),
                y + (e.movementY/2),
            ];
            
            //console.log('middle', middleX, middleY);

            const length = Math.sqrt(e.movementX**2 + e.movementY**2);

            //console.log('length', length);

            const [influenceX, influenceY] = gravityPoints.map(([gx, gy]) => {
                const [absoluteX, absoluteY] = [
                    (gx-middleX),
                    (gy-middleY)
                ];

                const gravityPointLength = Math.sqrt(absoluteX**2 + absoluteY**2);

                console.log(gravityPointLength);

                if(gravityPointLength > 100) {
                    return [0, 0];
                }

                return [
                    absoluteX / gravityPointLength,
                    absoluteY / gravityPointLength
                ];
            })
                .reduce(([ax, ay], [bx, by]) => [ax+bx, ay+by], [0, 0]);

            //console.log('influence', influenceX, influenceY);

            const [weightedInfluenceX, weightedInfluenceY] = [
                (influenceX/gravityPoints.length)*length*6 || 0,
                (influenceY/gravityPoints.length)*length*6 || 0
            ];

            //console.log('weightedInfluence', weightedInfluenceX, weightedInfluenceY);

            console.log('----------------');
            const screen = document.body.getBoundingClientRect();
            return [
                Math.max(8, Math.min(x + (e.movementX + weightedInfluenceX)/2, screen.width-8)),
                Math.max(8, Math.min(y + (e.movementY + weightedInfluenceY)/2, screen.height-8))
            ];
        });
    }

    const lockChangeAlert = (gravityPoints: ([number, number])[], domRects: DOMRect[]) => {
        const listener = (e: MouseEvent) => updatePosition(e, gravityPoints, domRects);

        if (document.pointerLockElement === document.body ||
            (document as any).mozPointerLockElement === document.body) {
            console.log('The pointer lock status is now locked');
            document.addEventListener("mousemove", listener, false);
        } else {
            console.log('The pointer lock status is now unlocked');
            setLocked(false);
            document.removeEventListener("mousemove", listener, false);
        }
    }

    const changeToggle = (to: boolean) => {
        setLocked(to);
        console.log(to);
        if (!to) {
            return;
        }


        const newGravityPoints: ([number, number])[] = [];

        const rects = Array.from(document.querySelectorAll('.hatch-button--primary, .bp4-control-indicator'))
            .map(element => element.getBoundingClientRect());

        rects.forEach(rect => {
            newGravityPoints.push([
                rect.left + rect.width/2,
                rect.top + rect.height/2
            ]);
        });

        console.log('new GravityPoints', newGravityPoints);

        document.body.requestPointerLock = document.body.requestPointerLock ||
            (document.body as any).mozRequestPointerLock;

        document.body.requestPointerLock();

        if ("onpointerlockchange" in document) {
            document.addEventListener('pointerlockchange', () => lockChangeAlert(newGravityPoints, rects), false);
        } else if ("onmozpointerlockchange" in document) {
            (document as any).addEventListener('mozpointerlockchange', () => lockChangeAlert(newGravityPoints, rects), false);
        }

    }

    return (
        <HatchFixedWidth maxInnerWidth='1200px' minPaddingLR='16px' pos='center'>
            <h1>Demo: Opinionated Mouse Pointer</h1>
            <HatchWrapper direction='row' space='--space-3'>
                <HatchWrapper>
                    <h3>Options</h3>
                    <HatchToggle checked={locked} label='Enable' onChange={to => changeToggle(to)} />
                    <div>
                        Position: ( {x.toFixed(2)} | {y.toFixed(2)} )
                    </div>
                    <div>
                        When enabled, the mouse pointer will gravitate towards clickable elements during movement.
                    </div>
                </HatchWrapper>
                <HatchWrapper direction='row'>
                    <HatchWrapper>
                        <HatchButton variant='primary'>Test Button №1</HatchButton>
                        <HatchButton>Test Button №2</HatchButton>
                        <HatchButton variant='primary'>Test Button №3</HatchButton>
                        <HatchButton>Test Button №4</HatchButton>
                    </HatchWrapper>
                    <HatchWrapper>
                        <HatchButton>Test Button №5</HatchButton>
                        <HatchButton variant='primary'>Test Button №6</HatchButton>
                        <HatchButton>Test Button №7</HatchButton>
                        <HatchButton variant='primary'>Test Button №8</HatchButton>
                    </HatchWrapper>
                    <HatchWrapper>
                        <HatchButton variant='primary'>Test Button №9</HatchButton>
                        <HatchButton>Test Button №10</HatchButton>
                        <HatchButton variant='primary'>Test Button №11</HatchButton>
                        <HatchButton>Test Button №12</HatchButton>
                    </HatchWrapper>
                    <HatchWrapper>
                        <HatchButton>Test Button №13</HatchButton>
                        <HatchButton variant='primary'>Test Button №14</HatchButton>
                        <HatchButton>Test Button №15</HatchButton>
                        <HatchButton variant='primary'>Test Button №16</HatchButton>
                    </HatchWrapper>
                </HatchWrapper>
                <HatchWrapper style={{ width: '500px' }} space='10px'>
                    <HatchRadio
                        helpText="Additional text №1."
                        label="Test radio №1"
                    />
                    <HatchRadio
                        helpText="Additional text №2."
                        label="Test radio №2"
                    />
                    <HatchRadio
                        helpText="Additional text №3."
                        label="Test radio №3"
                    />
                    <HatchRadio
                        helpText="Additional text №4."
                        label="Test radio №4"
                    />
                    <HatchRadio
                        helpText="Additional text №5."
                        label="Test radio №5"
                    />
                    <HatchRadio
                        helpText="Additional text №6."
                        label="Test radio №6"
                    />
                    <HatchRadio
                        helpText="Additional text №7."
                        label="Test radio №7"
                    />
                </HatchWrapper>
            </HatchWrapper>
            <div className={`pointer ${locked ? '' : 'pointer--hidden'}`} style={{
                left: `${x.toFixed(2)}px`,
                top: `${y.toFixed(2)}px`
            }}></div>
        </HatchFixedWidth>
    )
}

export default App
