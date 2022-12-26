import { BaseSyntheticEvent, SyntheticEvent, useEffect, useState } from 'react';
import './App.css';
import { HatchButton, HatchFixedWidth, HatchRadio, HatchToggle, HatchWrapper } from '@hatch/hds';
import '@hatch/hds/dist/global.min.css';
import '@hatch/hds/dist/T1.min.css';

function App() {
    const [[x, y], setXY] = useState<[number, number]>([200, 200]);
    const [locked, setLocked] = useState(false);
    const [showLeave, setShowLeave] = useState(false);
    const [pointerLockListener, setPointerLockListener] = useState<() => void>();
    const [mousemoveListener, setMousemoveListener] = useState<(e: MouseEvent) => void>();
    const [intensity, setIntensity] = useState<number>(50);

    useEffect(() => {
        const clickListener = () => {
            if(locked) {
                const element = document.elementFromPoint(x, y);

                (document.elementFromPoint(x, y) as any)?.click();
                (document.elementFromPoint(x, y) as any)?.focus();
            }
        };

        document.addEventListener('click', clickListener);

        return () => document.removeEventListener('click', clickListener);
    }, [locked, x, y, locked]);

    const updatePosition = (e: MouseEvent, gravityPoints: ([number, number])[], rects: DOMRect[]) => {
        setXY(([x, y]) => {
            const [middleX, middleY] = [
                x + (e.movementX/2),
                y + (e.movementY/2),
            ];

            const length = Math.sqrt(e.movementX**2 + e.movementY**2);

            const [influenceX, influenceY] = gravityPoints.map(([gx, gy]) => {
                const [absoluteX, absoluteY] = [
                    (gx-middleX),
                    (gy-middleY)
                ];

                const gravityPointLength = Math.sqrt(absoluteX**2 + absoluteY**2);

                if(gravityPointLength > 100) {
                    return [0, 0];
                }

                return [
                    absoluteX / gravityPointLength,
                    absoluteY / gravityPointLength
                ];
            })
                .reduce(([ax, ay], [bx, by]) => [ax+bx, ay+by], [0, 0]);

            const [weightedInfluenceX, weightedInfluenceY] = [
                (influenceX/gravityPoints.length)*length*6*(intensity/50) || 0,
                (influenceY/gravityPoints.length)*length*6*(intensity/50) || 0
            ];

            const screen = document.body.getBoundingClientRect();

            const pos: [number, number] = [
                Math.max(8, Math.min(x + (e.movementX + weightedInfluenceX)/2, screen.width-8)),
                Math.max(8, Math.min(y + (e.movementY + weightedInfluenceY)/2, screen.height-8))
            ];

            setShowLeave(pos[0] < 48 || pos[1] < 48 || pos[0] > screen.width - 48 || pos[1] > screen.height - 48);

            return pos;
        });
    }

    const lockChangeAlert = (gravityPoints: ([number, number])[], domRects: DOMRect[]) => {
        setLocked(false);

        if (document.pointerLockElement === document.body ||
            (document as any).mozPointerLockElement === document.body) {

            const newListener = (e: MouseEvent) => updatePosition(e, gravityPoints, domRects);
            setMousemoveListener(() => newListener);
            
            setLocked(true);
            document.addEventListener('mousemove', newListener, false);
        } else {
            setLocked(false);
            if(pointerLockListener) document.removeEventListener('pointerlockchange', pointerLockListener, false);
            if(mousemoveListener) document.removeEventListener('mousemove', mousemoveListener, false);
        }
    }

    const changeToggle = (to: BaseSyntheticEvent) => {
        setLocked(to.target.checked);
        if (!to.target.checked) {
            if(pointerLockListener) document.removeEventListener('pointerlockchange', pointerLockListener, false);
            if(mousemoveListener) document.removeEventListener('mousemove', mousemoveListener, false);
            document.exitPointerLock();
            return;
        }

        const newGravityPoints: ([number, number])[] = [];

        const rects = Array.from(document.querySelectorAll('.hatch-button--primary, .hatch-radio__label:not(.hatch-radio__disabled) .bp4-control-indicator, .hatch-toggle-slider'))
            .map(element => element.getBoundingClientRect());

        rects.forEach(rect => {
            newGravityPoints.push([
                rect.left + rect.width/2,
                rect.top + rect.height/2
            ]);
        });

        document.body.requestPointerLock = document.body.requestPointerLock ||
            (document.body as any).mozRequestPointerLock;

        document.body.requestPointerLock();

        if(pointerLockListener) {
            document.removeEventListener('pointerlockchange', pointerLockListener, false);
        }

        const newPointerLockListener = () => lockChangeAlert(newGravityPoints, rects);
        setPointerLockListener(() => newPointerLockListener);

        if ('onpointerlockchange' in document) {
            document.addEventListener('pointerlockchange', newPointerLockListener, false);
        } else if ('onmozpointerlockchange' in document) {
            (document as any).addEventListener('mozpointerlockchange', newPointerLockListener, false);
        }  
    }

    return (
        <HatchFixedWidth maxInnerWidth='1100px' minPaddingLR='16px' pos='center' style={{ overflowY: 'auto' }} space='--space-3'>
            <HatchWrapper direction='row' space='--space-2'>
                <a className="logo" href="https://goldst.dev">
                    <div className="logo-image"></div>
                </a>
                <h1>
                    Experiment: Opinionated Mouse Pointer
                </h1>
            </HatchWrapper>
            
            <HatchWrapper direction='row' space='--space-6' style={{ flexWrap: 'wrap' }}>
                <HatchWrapper style={{ minWidth: '200px', flexGrow: 1, width: 0 }}>
                    <h3>Options</h3>
                    <HatchToggle checked={locked} label='Enable' onChange={(to: SyntheticEvent) => changeToggle(to)} />
                    <label>
                        <div>Gravity: {intensity}%</div>
                        <input className='range' disabled={locked} type="range" min="1" max="100" value={intensity} onChange={e => setIntensity(parseInt(e.target.value))} style={{ width:'100%'}}></input>
                    </label>
                    <div>
                        Position: ( {x.toFixed(2)} | {y.toFixed(2)} )
                    </div>
                    <p>
                        When enabled, the mouse pointer will gravitate towards some clickable elements during movement.
                    </p>
                    <p>
                        I created this experiment to test how an opinionated mouse pointer would feel on a new version of my personal website. You can find the current version, as well as other experiments, at <a href="https://goldst.dev">goldst.dev</a>.
                    </p>
                    <p>
                        This project uses <code>@<a href="https://hatch.studio">hatch</a>/hds</code>, a propietary component library. The experiment itself is available under the <a href="https://raw.githubusercontent.com/goldst/demo-opinionated-mouse-pointer/main/LICENSE">MIT license</a>.
                    </p>
                    <p>
                        <a href="https://github.com/goldst/demo-opinionated-mouse-pointer/">Fork this on GitHub</a> | <a href="https://goldst.dev/impressum.html">Impressum</a>
                    </p>
                </HatchWrapper>
                <HatchWrapper style={{ width: '200px' }} space='10px'>
                    <HatchRadio
                        label='Test radio №1'
                        helpText='Additional text №1.'
                        className=''
                    />
                    <HatchRadio
                        label='Test radio №2'
                        helpText='Additional text №2.'
                        className=''
                    />
                    <HatchRadio
                        label='Test radio №3'
                        helpText='Additional text №3.'
                        className=''
                    />
                    <HatchRadio
                        label='Test radio №4'
                        helpText='Additional text №4.'
                        className=''
                    />
                    <HatchRadio
                        disabled={true}
                        label='Disabled radio №5'
                        helpText='Additional text №5.'
                        className=''
                    />
                    <HatchRadio
                        label='Test radio №6'
                        helpText='Additional text №6.'
                        className=''
                    />
                    <HatchRadio
                        label='Test radio №7'
                        helpText='Additional text №7.'
                        className=''
                    />
                    <HatchRadio
                        label='Test radio №8'
                        helpText='Additional text №8.'
                        className=''
                    />
                </HatchWrapper>
                <div className='buttons'>
                    <HatchButton variant='primary'>Test Button № 1</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 2</HatchButton>
                    <HatchButton variant='primary'>Test Button № 3</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 4</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 5</HatchButton>
                    <HatchButton variant='primary'>Test Button № 6</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 7</HatchButton>
                    <HatchButton variant='primary'>Test Button № 8</HatchButton>
                    <HatchButton variant='primary'>Test Button № 9</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 10</HatchButton>
                    <HatchButton variant='primary'>Test Button № 11</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 12</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 13</HatchButton>
                    <HatchButton variant='primary'>Test Button № 14</HatchButton>
                    <HatchButton disabled={true}>Disabled Button № 15</HatchButton>
                    <HatchButton variant='primary'>Test Button № 16</HatchButton>
                </div>
            </HatchWrapper>
            <div className={`pointer ${locked ? '' : 'pointer--hidden'}`} style={{
                left: `${x.toFixed(2)}px`,
                top: `${y.toFixed(2)}px`
            }}></div>
            <div className='escape-message' style={{
                opacity: locked && showLeave ? 1 : 0
            }}>
                Press <kbd key='escape'>Esc</kbd> to leave
            </div>
        </HatchFixedWidth>
    )
}

export default App
