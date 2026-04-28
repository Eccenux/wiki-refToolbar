/**
 * Tests for parsing NamedRefs.
 */
import { describe, it, expect } from 'vitest';
import refsTB from '../refToolbar';

describe('_getNamedRefs', () => {

	it('extracts double-quoted names', () => {
		const input = '<ref name="test1">';
		expect(refsTB._getNamedRefs(input)).toEqual(['test1']);
	});

	it('extracts single-quoted names', () => {
		const input = "<ref name='test2'>";
		expect(refsTB._getNamedRefs(input)).toEqual(['test2']);
	});

	it('extracts unquoted names', () => {
		const input = '<ref name=test3>';
		expect(refsTB._getNamedRefs(input)).toEqual(['test3']);
	});

	it('extracts names with details and attrs', () => {
		let inputs = [
			`<ref name="test3" details="s. 56–78">`,
			`<ref name='test3' details="s. 56–78">`,
			`<ref name=test3 details="s. 56–78">`,
			`<ref name=test3 details="s. 56–78" whatever-new-attribute="kopytko">`,
			`<ref name=test3 whatever-new-attribute="kopytko">`,
		];
		for (const input of inputs) {
			expect(refsTB._getNamedRefs(input)).toEqual(['test3']);
		}
	});

	it('extracts multiple refs', () => {
		const input = '<ref name="a"><ref name="b"><ref name="c">';
		expect(refsTB._getNamedRefs(input)).toEqual(['a', 'b', 'c']);
	});

	it('ignores self-closing when calls=false', () => {
		const input = '<ref name="a" />';
		expect(refsTB._getNamedRefs(input)).toEqual([]);
	});

	it('handles self-closing when calls=true', () => {
		const input = '<ref name="a" />';
		expect(refsTB._getNamedRefs(input, true)).toEqual(['a']);
	});

	it('handles mixed formats', () => {
		const input = `<ref name="a"><ref name='b'><ref name=c>`;
		expect(refsTB._getNamedRefs(input)).toEqual(['a', 'b', 'c']);
	});

	it('find nonunique calls', () => {
		const input = `<ref name="a" /><ref name='a' /><ref name=b />`;
		expect(refsTB._getNamedRefs(input, true)).toEqual(['a', 'a', 'b']);
	});

	it('find all unique names of refs', () => {
		const input = `<ref name="a" /><ref name='a' /><ref name=b /><ref name='a'><ref name='c'>`;
		expect(refsTB._getAllNames(input, true)).toEqual(['a', 'b', 'c']);
	});

	it('returns empty array when no refs', () => {
		expect(refsTB._getNamedRefs('no refs here')).toEqual([]);
	});
});